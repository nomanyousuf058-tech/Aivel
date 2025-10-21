import { env, isEnabled } from './env'

export const providerFlags = {
  openai: isEnabled(env.OPENAI_API_KEY),
  deepseek: isEnabled(env.DEEPSEEK_API_KEY),
  notion: isEnabled(env.NOTION_API_KEY),
  jasper: isEnabled(env.JASPER_API_KEY),
  zapier: isEnabled(env.ZAPIER_KEY) || isEnabled(env.ZAPIER_WEBHOOK_URL),
  make: isEnabled(env.MAKE_WEBHOOK_URL),
}

export type ProviderName = keyof typeof providerFlags



