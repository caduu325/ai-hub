import {routePrompt} from "../../../lib/router";

export const runtime="nodejs";

type DirectResult={text:string;provider:string;model:string};

async function gemini(prompt:string):Promise<DirectResult>{
  const key=process.env.GEMINI_API_KEY;
  if(!key) throw new Error("GEMINI_API_KEY não configurada");
  const preferred=process.env.GEMINI_MODEL;
  const models=[preferred,"gemini-3.8-flash","gemini-3.5-flash-lite","gemini-3.5-flash"].filter((m,i,a):m is string=>Boolean(m)&&a.indexOf(m)===i);
  let lastError="Gemini indisponível";
  for(const model of models){
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},
      body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
    });
    const data=await r.json();
    if(r.ok){
      const text=data?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("")||"";
      return{text,provider:"google",model};
    }
    lastError=data?.error?.message||`Erro no modelo ${model}`;
    const retryable=r.status===429||r.status===503||/high demand|overloaded|unavailable/i.test(lastError);
    if(!retryable) throw new Error(lastError);
  }
  throw new Error(lastError);
}

async function deepseek(prompt:string):Promise<DirectResult>{
  const key=process.env.DEEPSEEK_API_KEY;
  if(!key) throw new Error("DEEPSEEK_API_KEY não configurada");
  const model=process.env.DEEPSEEK_MODEL||"deepseek-flash";
  const r=await fetch("https://api.deepseek.com/chat/completions",{
    method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
    body:JSON.stringify({model,messages:[{role:"user",content:prompt}],stream:false})
  });
  const data=await r.json();
  if(!r.ok) throw new Error(data?.error?.message||"Erro na API DeepSeek");
  return{text:data?.choices?.[0]?.message?.content||"",provider:"deepseek",model};
}

async function callDirect(prompt:string,selected:string):Promise<DirectResult>{
  if(selected==="Gemini") return gemini(prompt);
  if(selected==="DeepSeek") return deepseek(prompt);
  if(selected==="GPT") throw new Error("OPENAI_API_KEY ainda não configurada");
  if(selected==="Claude") throw new Error("ANTHROPIC_API_KEY ainda não configurada");
  // Automático: usa somente provedores realmente configurados, priorizando Gemini.
  if(process.env.GEMINI_API_KEY) return gemini(prompt);
  if(process.env.DEEPSEEK_API_KEY) return deepseek(prompt);
  throw new Error("Nenhuma API direta configurada. Adicione GEMINI_API_KEY ou DEEPSEEK_API_KEY na Vercel.");
}

export async function POST(req:Request){
  try{
    const body=await req.json();
    const prompt=String(body?.prompt??"").trim();
    const manualModel=String(body?.model??"Automático");
    if(!prompt)return Response.json({error:"Digite uma mensagem."},{status:400});
    const decision=routePrompt(prompt,manualModel);
    const started=Date.now();
    const result=await callDirect(prompt,manualModel);
    return Response.json({text:result.text,decision:{...decision,provider:result.provider,directModel:result.model},latencyMs:Date.now()-started});
  }catch(error){
    const message=error instanceof Error?error.message:"Falha ao executar a IA.";
    return Response.json({error:message},{status:500});
  }
}