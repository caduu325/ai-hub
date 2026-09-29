import type {HubModel} from "./models";
export type ProviderRequest={prompt:string;model:HubModel;conversationId?:string};
export type ProviderResponse={text:string;modelId:string;provider:string;latencyMs:number};
export interface AIProvider{provider:string;generate(input:ProviderRequest):Promise<ProviderResponse>}
export const providerAdapters=new Map<string,AIProvider>();
export function registerProvider(adapter:AIProvider){providerAdapters.set(adapter.provider,adapter)}
