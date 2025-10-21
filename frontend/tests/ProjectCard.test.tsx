import { render, screen } from '@testing-library/react'
import ProjectCard from '@/components/ui/ProjectCard'
import { Project } from '@/types'

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  type: 'web',
  description: 'A test project description',
  status: 'active',
  createdAt: '2024-01-25T10:00:00Z',
  updatedAt: '2024-01-26T10:00:00Z',
  technologies: ['Next.js', 'TypeScript'],
  repositoryUrl: 'https://github.com/example/repo',
  liveUrl: 'https://example.com'
}

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A test project description')).toBeInTheDocument()
    expect(screen.getByText('Web App')).toBeInTheDocument()
    expect(screen.getByText(/Created/)).toBeInTheDocument()
  })

  it('shows correct status badge', () => {
    render(<ProjectCard project={mockProject} />)

    expect(screen.getByText('active')).toBeInTheDocument()
  })
})