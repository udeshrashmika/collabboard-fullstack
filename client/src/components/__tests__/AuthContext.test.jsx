import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext.jsx'
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

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

const FAKE_USER = { id: '1', name: 'Test User', email: 'test@example.com' }

describe('AuthContext', () => {
  beforeEach(() => {
    apiClient.get.mockRejectedValue(new Error('no session'))
  })

  it('starts unauthenticated when there is no stored token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('stores the token and user after a successful login', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 'jwt-123', user: FAKE_USER } })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'Password123')
    })

    expect(localStorage.getItem('collabboard_token')).toBe('jwt-123')
    expect(JSON.parse(localStorage.getItem('collabboard_user')).email).toBe(FAKE_USER.email)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('registers a new user and signs them in', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 'jwt-reg', user: FAKE_USER } })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'Password123')
    })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('clears storage on logout', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 'jwt-123', user: FAKE_USER } })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'Password123')
    })
    act(() => result.current.logout())

    expect(localStorage.getItem('collabboard_token')).toBeNull()
    expect(localStorage.getItem('collabboard_user')).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('revalidates a stored token on mount and keeps the session', async () => {
    localStorage.setItem('collabboard_token', 'stored-jwt')
    apiClient.get.mockResolvedValue({ data: { user: FAKE_USER } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    expect(result.current.user.email).toBe(FAKE_USER.email)
  })

  it('drops an expired stored token', async () => {
    localStorage.setItem('collabboard_token', 'expired-jwt')
    apiClient.get.mockRejectedValue({ response: { status: 401 } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(localStorage.getItem('collabboard_token')).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('merges partial updates into the current user', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 'jwt-123', user: FAKE_USER } })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'Password123')
    })
    act(() => result.current.updateUser({ name: 'Renamed User' }))

    expect(result.current.user.name).toBe('Renamed User')
    expect(result.current.user.email).toBe(FAKE_USER.email)
  })
})