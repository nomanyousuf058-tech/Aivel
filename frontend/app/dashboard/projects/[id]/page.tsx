import { redirect } from 'next/navigation'

export default async function ProjectIndex({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  redirect(`/dashboard/projects/${p.id}/technical`)
}