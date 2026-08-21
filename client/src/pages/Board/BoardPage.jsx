const columns = [
  { title: 'To Do', tasks: ['Create wireframes', 'Set up routes'] },
  { title: 'Doing', tasks: ['Build board interface'] },
  { title: 'Done', tasks: ['Create repository'] },
]

export default function BoardPage() {
  return (
    <main className="page">
      <div className="topbar">
        <div>
          <span className="eyebrow">Board</span>
          <h1>Project Alpha</h1>
        </div>
        <button className="button primary">Add Task</button>
      </div>
      <section className="kanban">
        {columns.map((column) => (
          <div className="column" key={column.title}>
            <div className="column-heading">
              <h2>{column.title}</h2>
              <span>{column.tasks.length}</span>
            </div>
            {column.tasks.map((task) => (
              <article className="card task-card" key={task}>{task}</article>
            ))}
          </div>
        ))}
      </section>
    </main>
  )
}
