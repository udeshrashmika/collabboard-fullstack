import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/renderWithProviders.jsx'
import Login from '../Login.jsx'
import apiClient from '../../api/apiClient'

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

/*
 * Note on queries: /password/i also matches the visibility-toggle button,
 * whose accessible name is "Show password". The anchored /^password$/i
 * matches only the input's own label.
 */
const emailField = () => screen.getByLabelText(/email/i)
const passwordField = () => screen.getByLabelText(/^password$/i)
const submitButton = () => screen.getByRole('button', { name: /sign in/i })

describe('<Login />', () => {
  beforeEach(() => {
    apiClient.get.mockRejectedValue(new Error('no session'))
  })

  it('renders the email and password fields', () => {
    renderWithProviders(<Login />)

    expect(emailField()).toBeInTheDocument()
    expect(passwordField()).toBeInTheDocument()
  })

  it('exposes a password visibility toggle', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
    expect(passwordField()).toHaveAttribute('type', 'password')
  })

  it('shows a validation message when the form is submitted empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.click(submitButton())

    expect(await screen.findByText(/enter your email and password/i)).toBeInTheDocument()
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('posts the credentials and navigates on success', async () => {
    const user = userEvent.setup()
    apiClient.post.mockResolvedValue({
      data: {
        token: 'fake.jwt.token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
      },
    })

    renderWithProviders(<Login />)

    await user.type(emailField(), 'test@example.com')
    await user.type(passwordField(), 'Password123')
    await user.click(submitButton())

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'Password123',
      })
    })

    expect(localStorage.getItem('collabboard_token')).toBe('fake.jwt.token')
    expect(mockNavigate).toHaveBeenCalledWith('/board')
  })

  it('trims whitespace from the email before sending', async () => {
    const user = userEvent.setup()
    apiClient.post.mockResolvedValue({
      data: { token: 't', user: { id: '1', email: 'test@example.com' } },
    })

    renderWithProviders(<Login />)

    await user.type(emailField(), '  test@example.com  ')
    await user.type(passwordField(), 'Password123')
    await user.click(submitButton())

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({ email: 'test@example.com' })
      )
    })
  })

  it('surfaces the server error message on a failed login', async () => {
    const user = userEvent.setup()
    apiClient.post.mockRejectedValue({
      response: { status: 401, data: { message: 'Incorrect email or password' } },
    })

    renderWithProviders(<Login />)

    await user.type(emailField(), 'test@example.com')
    await user.type(passwordField(), 'WrongPass1')
    await user.click(submitButton())

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a network-specific message when the server is unreachable', async () => {
    const user = userEvent.setup()
    apiClient.post.mockRejectedValue({ code: 'ERR_NETWORK' })

    renderWithProviders(<Login />)

    await user.type(emailField(), 'test@example.com')
    await user.type(passwordField(), 'Password123')
    await user.click(submitButton())

    expect(await screen.findByText(/cannot reach the server/i)).toBeInTheDocument()
  })

  it('clears the error as soon as the user edits a field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.click(submitButton())
    expect(await screen.findByText(/enter your email and password/i)).toBeInTheDocument()

    await user.type(emailField(), 'a')

    await waitFor(() => {
      expect(screen.queryByText(/enter your email and password/i)).not.toBeInTheDocument()
    })
  })

  it('links to registration and password recovery', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
      'href',
      '/forgot-password'
    )
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute(
      'href',
      '/register'
    )
  })
})