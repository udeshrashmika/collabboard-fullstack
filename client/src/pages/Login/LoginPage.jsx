import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <main className="page center">
      <section className="card form-card">
        <h1>Sign in</h1>
        <p className="muted">Authentication will be connected by the backend team.</p>
        <form>
          <label>Email<input type="email" placeholder="you@example.com" /></label>
          <label>Password<input type="password" placeholder="••••••••" /></label>
          <button className="button primary" type="submit">Sign In</button>
        </form>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  )
}
