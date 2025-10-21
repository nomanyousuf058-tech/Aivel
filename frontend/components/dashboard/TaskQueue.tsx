"use client";
import React from 'react'

export default function TaskQueue() {
  const [objective, setObjective] = React.useState('Prioritize next sprint goals')
  const [role, setRole] = React.useState<'CEO'|'DEVELOPER'|'MARKETING'|'OPERATIONS'>('CEO')
  const [result, setResult] = React.useState<string>('')

  const run = async () => {
    setResult('Running...')
    const res = await fetch('/api/ai/brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, objective }),
    })
    const data = await res.json()
    setResult(data?.result || 'No result')
  }

  return (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="font-semibold">Brain Task Runner</div>
      <div className="flex gap-2">
        <select value={role} onChange={e => setRole(e.target.value as any)} className="border px-2 py-1 rounded">
          <option>CEO</option>
          <option>DEVELOPER</option>
          <option>MARKETING</option>
          <option>OPERATIONS</option>
        </select>
        <input className="flex-1 border px-2 py-1 rounded" value={objective} onChange={e=>setObjective(e.target.value)} />
        <button onClick={run} className="px-3 py-1 bg-black text-white rounded">Run</button>
      </div>
      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded">{result}</pre>
    </div>
  )
}



