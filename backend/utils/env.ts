import { z } from 'zod'

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  NOTION_API_KEY: z.string().min(1).optional(),
  JASPER_API_KEY: z.string().min(1).optional(),
  ZAPIER_KEY: z.string().min(1).optional(),
  ZAPIER_WEBHOOK_URL: z.string().url().optional(),
  MAKE_WEBHOOK_URL: z.string().url().optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse(process.env)

export const isEnabled = (key?: string | null) => Boolean(key && key.length > 0)



