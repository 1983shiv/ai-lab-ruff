import { BedrockRuntimeClient, InvokeModelCommand, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import type { Message, Tool } from "@aws-sdk/client-bedrock-runtime";

export const DIMS = 512;
export const env = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
}).process?.env ?? {};

export const MODEL_TAG = env.MODE === 'bedrock' ? 'titan-v2-256' : 'fake-256';

// Config for talking to Floci (local). 
// Empty on real AWS.

export function awsConfig(){
    const endpoint = env.LOCAL_ENDPOINT;
    return endpoint ? { endpoint, region: 'ap-south-1', credentials: {
        accessKeyId: 'test', secretAccessKey: 'test'
    }} : {};    
}

const BEDROCK_REGION = env.BEDROCK_REGION || 'ap-south-1';

// Bedrock always goes to REAL AWS,  never to Floci
const bedrock = new BedrockRuntimeClient({
  region: BEDROCK_REGION,
  endpoint: 'https://bedrock-runtime.' + BEDROCK_REGION + '.amazonaws.com',
});


export function normalize(v: number[]): number[]{
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    return norm === 0 ? v : v.map((x) => x / norm)
}

export function cosine(a: number[], b: number[]): number{
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++){
        const ai = a[i] ?? 0;
        const bi = b[i] ?? 0;
        dot += ai * bi;
        na += ai * ai;
        nb += bi * bi;
    }

    return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb)
}

// Fake embedding: count words into 256 buckets. same words = similar vector. No real meaning

export function fakeEmbed(text: string) : number[]{
    const v = new Array(DIMS).fill(0);
    for(const word of text.toLowerCase().match(/[a-z0-9]+/g) ?? []){
        let h = 0
        for(const ch of word){
            h = h * 31 + ch.charCodeAt(0);
        }
        v[h%DIMS] += 1;
    }
    return normalize(v)
}

export async function embed(text: string): Promise<number[]>{
    
    if (!text.trim()) throw new Error('Cannot embed empty text');

    if (env.MODE !== 'bedrock'){
        return fakeEmbed(text);
    }

    const res = await bedrock.send(new InvokeModelCommand({
        modelId: 'amazon.titan-embed-text-v2:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            inputText: text, dimensions: DIMS, normalize: true
        })
    }))

    return JSON.parse(new TextDecoder().decode(res.body)).embedding;
}

// Chat model through the Converse API. Set MODEL_ID to a chat model you enbaled in bedrock.
export async function chat(opts: { system? : string; messages: Message[]; tools?: Tool[]; maxTokens?: number}){
    return bedrock.send(new ConverseCommand({
        modelId: env.MODEL_ID!,
        system: (opts.system ? [{ text: opts.system}] : undefined),
        messages: opts.messages,
        toolConfig: opts.tools ? { tools : opts.tools} : undefined,
        inferenceConfig: { maxTokens: opts.maxTokens ?? 600, temperature: 0},
    }))
}


