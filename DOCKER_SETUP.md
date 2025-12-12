# Docker Setup Guide

## Fixed Issues ✅

1. **Frontend service configuration** - Updated paths and environment variables
2. **Created `Dockerfile.dev`** for frontend with Vite configuration
3. **Updated Vite config** to work with Docker (host 0.0.0.0, port 5173)
4. **Fixed environment variables** - Changed from REACT*APP*_ to VITE\__
5. **Added `.dockerignore`** to optimize build

## Services

- **delineate-app** (Backend): http://localhost:3000
- **frontend**: http://localhost:5173
- **Jaeger UI**: http://localhost:16686
- **RustFS (S3 compatible)**: http://localhost:9000
- **RustFS UI (MinIO Console)**: http://localhost:9001

## Quick Start

### Build all services:

```bash
docker compose -f docker/compose.dev.yml build
```

### Build frontend only:

```bash
docker compose -f docker/compose.dev.yml build frontend
```

### Start all services:

```bash
docker compose -f docker/compose.dev.yml up
```

### Start in detached mode:

```bash
docker compose -f docker/compose.dev.yml up -d
```

### Stop services:

```bash
docker compose -f docker/compose.dev.yml down
```

### View logs:

```bash
docker compose -f docker/compose.dev.yml logs -f frontend
```

## Frontend Configuration

The frontend is configured to:

- Run on port **5173** (Vite default)
- Hot reload enabled with file watching
- Connect to backend at **http://localhost:3000**
- Use environment variables from `.env` file

### Environment Variables (frontend/.env)

```env
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=https://your-sentry-dsn
```

## Development Workflow

1. Make changes to frontend code in `frontend/src/`
2. Changes auto-reload in Docker container
3. Access frontend at http://localhost:5173
4. Backend API available at http://localhost:3000

## Troubleshooting

### Port already in use:

```bash
# Find and kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Rebuild after dependency changes:

```bash
docker compose -f docker/compose.dev.yml build --no-cache frontend
```

### View container logs:

```bash
docker compose -f docker/compose.dev.yml logs frontend
```

### Access container shell:

```bash
docker compose -f docker/compose.dev.yml exec frontend sh
```
