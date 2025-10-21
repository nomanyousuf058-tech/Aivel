import { env } from '@/utils/env'
import { chatOpenAI } from './openai'

export async function generateMarketingCopy(prompt: string) {
  if (!env.JASPER_API_KEY) {
    const fallback = await chatOpenAI([
      { role: 'system', content: 'You are a senior marketing copywriter.' },
      { role: 'user', content: prompt },
    ])
    return { ...fallback, provider: fallback.provider ?? 'openai', fallback: true }
  }
  // Hypothetical Jasper endpoint
  const res = await fetch('https://api.jasper.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.JASPER_API_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error('Jasper API error')
  const data = await res.json()
  return { content: data.text ?? '', provider: 'jasper' }
}



