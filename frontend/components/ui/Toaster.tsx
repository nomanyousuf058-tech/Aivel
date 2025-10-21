'use client'

import * as React from 'react'

type Toast = { id: number; message: string }

const ToastContext = React.createContext<{
  show: (message: string) => void
} | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToasterProvider>')
  return ctx
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const show = (message: string) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white backdrop-blur">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}





