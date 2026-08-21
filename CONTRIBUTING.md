# Contributing

## Workflow

1. Pull the latest `develop`.
2. Create a branch from `develop`.
3. Make small, meaningful commits.
4. Push your branch.
5. Open a pull request into `develop`.
6. Get at least one review before merging.

## Branch Naming

```text
feature/m01-auth-ui
feature/m02-dashboard
feature/m03-kanban
feature/m04-auth-api
feature/m05-board-api
feature/m06-task-api
feature/m07-database-models
feature/m08-database-integration
test/m09-test-suite
ci/m10-github-actions
```

## Commit Examples

```text
feat(auth): add login form
feat(board): add board creation endpoint
test(auth): add login integration test
docs(api): document board endpoints
chore(docker): add compose configuration
```

Do not commit secrets or `.env` files.
