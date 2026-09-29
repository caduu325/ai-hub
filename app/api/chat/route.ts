import {generateText} from "ai";
import {routePrompt} from "../../../lib/router";

export const runtime="nodejs";

const gatewayModels:Record<string,string>={
  gpt:"openai/gpt-5.6",
  claude:"anthropic/claude-sonnet-5.5",
  gemini:"google/gemini-3.8-flash",
  deepseek:"deepseek/deepseek-v4.1-flash"
};

export async function POST(req:Request){
  try{
    const body=await req.json();
    const prompt=String(body?.prompt??"").trim();
    const manualModel=String(body?.model??"Automático");
    if(!prompt)return Response.json({error:"Digite uma mensagem."},{status:400});
    const decision=routePrompt(prompt,manualModel);
    const model=gatewayModels[decision.modelId];
    if(!model)return Response.json({error:"Modelo ainda não configurado.",decision},{status:400});
    const started=Date.now();
    const result=await generateText({
      model,
      prompt,
      providerOptions:{gateway:{tags:["app:ai-hub",`task:${decision.task}`]}}
    });
    return Response.json({text:result.text,decision:{...decision,gatewayModel:model},latencyMs:Date.now()-started,usage:result.usage});
  }catch(error){
    const message=error instanceof Error?error.message:"Falha ao executar a IA.";
    return Response.json({error:message},{status:500});
  }
}