export type MemoryScope="global"|"project"|"conversation";
export type MemoryRecord={id:string;scope:MemoryScope;scopeId?:string;content:string;createdAt:string;importance:number};
export interface MemoryStore{save(memory:Omit<MemoryRecord,"id"|"createdAt">):Promise<MemoryRecord>;search(query:string,scope?:MemoryScope,scopeId?:string):Promise<MemoryRecord[]>}
