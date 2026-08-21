import { Link } from 'react-router-dom'

const boards = [
  { id: 'demo', title: 'Project Alpha', description: 'Frontend, backend and testing tasks' },
  { id: 'design', title: 'Design Sprint', description: 'UI ideas and component planning' },
]

export default function DashboardPage() {
  return (
    <main className="page">
      <div className="topbar">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>Dashboard</h1>
        </div>
        <button className="button primary">New Board</button>
      </div>
      <section className="grid">
        {boards.map((board) => (
          <Link key={board.id} to={`/boards/${board.id}`} className="card board-card">
            <h2>{board.title}</h2>
            <p>{board.description}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
