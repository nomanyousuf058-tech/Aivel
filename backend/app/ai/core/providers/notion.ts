import { env } from '@/utils/env'

export async function notionSearch(query: string) {
  if (!env.NOTION_API_KEY) return { results: [], mocked: true }
  const res = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error('Notion API error')
  return res.json()
}



