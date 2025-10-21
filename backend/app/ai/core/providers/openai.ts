import OpenAI from 'openai'
import { env } from '@/utils/env'

export const openaiClient = () => {
  if (!env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: env.OPENAI_API_KEY })
}

export async function chatOpenAI(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, model = 'gpt-4o') {
  const client = openaiClient()
  if (!client) return { content: 'OpenAI not configured', provider: 'openai', mocked: true }
  const res = await client.chat.completions.create({ model, messages })
  return { content: res.choices?.[0]?.message?.content ?? '', provider: 'openai' }
}



