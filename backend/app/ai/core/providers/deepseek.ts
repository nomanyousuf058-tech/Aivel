import { env } from '@/utils/env'

export async function chatDeepseek(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, model = 'deepseek-chat') {
  if (!env.DEEPSEEK_API_KEY) return { content: 'DeepSeek not configured', provider: 'deepseek', mocked: true }
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  })
  if (!res.ok) throw new Error('DeepSeek API error')
  const data = await res.json()
  return { content: data.choices?.[0]?.message?.content ?? '', provider: 'deepseek' }
}



