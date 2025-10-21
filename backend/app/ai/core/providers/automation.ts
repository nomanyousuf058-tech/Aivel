import { env } from '@/utils/env'

export async function triggerZapier(event: string, payload: any) {
  if (env.ZAPIER_WEBHOOK_URL) {
    const res = await fetch(env.ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload }),
    })
    return { ok: res.ok, provider: 'zapier' }
  }
  if (env.ZAPIER_KEY) {
    // Placeholder for Zapier Actions API
    return { ok: true, provider: 'zapier', mocked: true }
  }
  if (env.MAKE_WEBHOOK_URL) {
    const res = await fetch(env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload }),
    })
    return { ok: res.ok, provider: 'make' }
  }
  return { ok: true, mocked: true }
}



