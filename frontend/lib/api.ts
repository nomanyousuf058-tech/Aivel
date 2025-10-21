import { Project, InvestmentProposal, SystemFund } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint)
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }
}

const apiClient = new ApiClient(API_BASE)

// Helper function to validate and convert project data
const validateProject = (data: any): Project => {
  const validTypes = ['web', 'mobile', 'desktop', 'api', 'other'] as const
  const validStatuses = ['active', 'archived', 'draft'] as const

  return {
    id: data.id || '',
    name: data.name || '',
    description: data.description || '',
    type: validTypes.includes(data.type) ? data.type as Project['type'] : 'other',
    status: validStatuses.includes(data.status) ? data.status as Project['status'] : 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    technologies: data.technologies || [],
    repositoryUrl: data.repositoryUrl,
    liveUrl: data.liveUrl,
  }
}

export const projectsApi = {
  getAll: async (): Promise<{ data: Project[] }> => {
    try {
      const response = await apiClient.get('/api/projects')
      
      // Handle different response structures
      let projectsData: any[] = []
      
      if (response && Array.isArray(response)) {
        projectsData = response
      } else if (response && response.data && Array.isArray(response.data)) {
        projectsData = response.data
      } else if (response && Array.isArray(response.projects)) {
        projectsData = response.projects
      } else {
        console.warn('Unexpected API response structure:', response)
        throw new Error('Invalid API response format')
      }
      
      // Validate and convert each project
      const validatedProjects: Project[] = projectsData.map(validateProject)
      
      return { data: validatedProjects }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      // Fallback to mock data with validation
      try {
        const mockProjects = (await import('@/mocks/projects.json')).default
        const mockData = mockProjects.projects || []
        const validatedProjects: Project[] = mockData.map(validateProject)
        return { data: validatedProjects }
      } catch (mockError) {
        console.error('Failed to load mock projects:', mockError)
        return { data: [] }
      }
    }
  },
  
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/api/projects/${id}`)
    return validateProject(response)
  },
  
  create: (data: Partial<Project>) => apiClient.post('/api/projects', data),
  
  update: (id: string, data: Partial<Project>) => 
    apiClient.put(`/api/projects/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/api/projects/${id}`),
  
  analyze: (id: string) => apiClient.post(`/api/projects/${id}/analyze`),
  
  getTechnical: (id: string) => apiClient.get(`/api/projects/${id}/technical`),
  
  autofix: (id: string) => apiClient.post(`/api/projects/${id}/autofix`),
}

// Add other API endpoints
export const adminApi = {
  getStats: () => apiClient.get('/api/admin/stats'),
  getUsers: () => apiClient.get('/api/admin/users'),
  updateUser: (id: string, data: any) => apiClient.put(`/api/admin/users/${id}`, data),
}

export const contentApi = {
  getAll: () => apiClient.get('/api/content'),
  create: (data: any) => apiClient.post('/api/content', data),
  update: (id: string, data: any) => apiClient.put(`/api/content/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/content/${id}`),
}

export const productsApi = {
  getAll: () => apiClient.get('/api/products'),
  getById: (id: string) => apiClient.get(`/api/products/${id}`),
  create: (data: any) => apiClient.post('/api/products', data),
  update: (id: string, data: any) => apiClient.put(`/api/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/products/${id}`),
  buy: (id: string) => apiClient.post(`/api/products/${id}/buy`),
}

export const investmentApi = {
  getAll: () => apiClient.get('/api/investments'),
  getById: (id: string) => apiClient.get(`/api/investments/${id}`),
  create: (data: Partial<InvestmentProposal>) => apiClient.post('/api/investments', data),
  update: (id: string, data: Partial<InvestmentProposal>) => apiClient.put(`/api/investments/${id}`, data),
  approve: (id: string) => apiClient.post(`/api/investments/${id}/approve`),
  reject: (id: string) => apiClient.post(`/api/investments/${id}/reject`),
}

export const fundsApi = {
  get: () => apiClient.get('/api/funds'),
  update: (data: Partial<SystemFund>) => apiClient.put('/api/funds', data),
  allocate: (data: { category: string; amount: number }) => apiClient.post('/api/funds/allocate', data),
}