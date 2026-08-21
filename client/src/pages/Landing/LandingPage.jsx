import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <main className="page center">
      <section className="card hero">
        <span className="eyebrow">Real-time team collaboration</span>
        <h1>CollabBoard</h1>
        <p>Plan work, organize tasks, and collaborate with your team from one shared board.</p>
        <div className="actions">
          <Link className="button primary" to="/register">Get Started</Link>
          <Link className="button secondary" to="/login">Sign In</Link>
        </div>
      </section>
    </main>
  )
}
