export type ModelCapability="general"|"code"|"writing"|"research"|"analysis"|"vision"|"reasoning";
export type HubModel={id:string;name:string;provider:string;enabled:boolean;capabilities:ModelCapability[];tier:"free"|"paid";priority:number};
export const modelRegistry:HubModel[]=[
{id:"gpt",name:"GPT",provider:"openai",enabled:true,capabilities:["general","code","writing","analysis","vision","reasoning"],tier:"paid",priority:90},
{id:"claude",name:"Claude",provider:"anthropic",enabled:true,capabilities:["general","code","writing","analysis","reasoning"],tier:"paid",priority:90},
{id:"gemini",name:"Gemini",provider:"google",enabled:true,capabilities:["general","code","writing","research","analysis","vision","reasoning"],tier:"free",priority:88},
{id:"deepseek",name:"DeepSeek",provider:"deepseek",enabled:true,capabilities:["general","code","analysis","reasoning"],tier:"free",priority:82},
];
export function enabledModels(){return modelRegistry.filter(m=>m.enabled).sort((a,b)=>b.priority-a.priority)}
