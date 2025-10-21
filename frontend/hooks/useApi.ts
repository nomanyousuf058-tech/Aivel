'use client'

import { useState, useEffect } from 'react'

export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}${url}`, options)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('API fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, options])

  return { data, loading, error }
}