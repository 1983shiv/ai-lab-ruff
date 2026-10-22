import { embed, cosine, env } from "../shared/ai.js"

console.log('mode:', env.MODE ?? 'fake')

const pairs: [string, string][] = [
    ['How do I get a refund?', 'I want my money back'],
    ['How do I get a refund?', 'What is the office wifi password?'],
    ['Refunds are allowed within 30 days', 'Refunds are not allowed after 30 days'],
    ['Order AB-1234 is late', 'Order AB-9999 is late'],
    ['Where is my invoice?', 'Can I get a copy of my bill?'],
    ['How do I reset my password?', 'I forgot my login details'],
    ['My subscription was cancelled', 'How do I renew my plan?'],
    ['मुझे रिफंड कैसे मिलेगा?', 'पैसा वापस पाने का क्या तरीका है?']
];

for (const [a, b] of pairs){
    const score = cosine(await embed(a), await embed(b));
    console.log(score.toFixed(3), '|', a, '<->', b);
}

