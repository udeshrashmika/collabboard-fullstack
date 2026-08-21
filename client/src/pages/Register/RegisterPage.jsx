import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <main className="page center">
      <section className="card form-card">
        <h1>Create account</h1>
        <form>
          <label>Name<input type="text" placeholder="Your name" /></label>
          <label>Email<input type="email" placeholder="you@example.com" /></label>
          <label>Password<input type="password" placeholder="Create a password" /></label>
          <button className="button primary" type="submit">Register</button>
        </form>
        <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  )
}
