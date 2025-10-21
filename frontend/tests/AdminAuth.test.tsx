import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminAuth from '@/components/ui/AdminAuth'

jest.useFakeTimers()

describe('AdminAuth', () => {
  const mockOnAuthenticate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders authentication form', () => {
    render(<AdminAuth onAuthenticate={mockOnAuthenticate} />)

    expect(screen.getByText('Admin Access')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter admin password')).toBeInTheDocument()
    expect(screen.getByText('Access Admin')).toBeInTheDocument()
  })

  it('shows error on invalid password', async () => {
    render(<AdminAuth onAuthenticate={mockOnAuthenticate} />)

    const input = screen.getByPlaceholderText('Enter admin password') as HTMLInputElement
    const submitButton = screen.getByText('Access Admin')

    fireEvent.change(input, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    // advance timers to resolve the 1500ms artificial delay
    jest.advanceTimersByTime(1600)

    await waitFor(() => {
      expect(mockOnAuthenticate).toHaveBeenCalledWith(false)
    })
  })
})