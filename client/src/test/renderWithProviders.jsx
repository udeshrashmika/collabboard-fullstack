// client/src/test/renderWithProviders.jsx
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../components/AuthContext.jsx'

/**
 * Renders a component inside the providers the real app supplies.
 *
 * @param ui           the element to render
 * @param route        initial URL (defaults to '/')
 * @param withAuth     wrap in AuthProvider (defaults to true)
 */
export function renderWithProviders(ui, { route = '/', withAuth = true } = {}) {
  const tree = withAuth ? <AuthProvider>{ui}</AuthProvider> : ui

  return render(<MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter>)
}

export * from '@testing-library/react'
