# Development Guide

## Setup Development Environment

### 1. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# AI Service
cd ai-service && pip install -r requirements.txt
```

### 2. Start Services
```bash
# Terminal 1 - Database
docker-compose up postgres redis

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - AI Service
cd ai-service && python main.py

# Terminal 4 - Frontend
cd frontend && npm start
```

## Code Standards

### JavaScript/Node.js
- Use ESLint configuration
- Follow Airbnb style guide
- Use async/await over callbacks
- Write unit tests with Jest

### Python
- Follow PEP 8
- Use type hints
- Write docstrings
- Test with pytest

### React
- Functional components with hooks
- PropTypes for type checking
- CSS with Tailwind utilities
- Component-level testing

## Git Workflow

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Production hotfixes
- `refactor/` - Code refactoring

### Commit Messages
```
type(scope): description

feat(api): add LiDAR upload endpoint
fix(ui): correct 3D render flicker
docs(readme): update installation steps
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
# Backend
cd backend && npm test -- routes/lidar.test.js

# Frontend
cd frontend && npm test -- AssetTable.test.js

# AI Service
cd ai-service && pytest tests/test_detector.py
```

## Debugging

### Backend
```bash
node --inspect src/server.js
```

### Frontend
Use React DevTools browser extension

### AI Service
```python
import pdb; pdb.set_trace()
```

## Performance Profiling

### Backend
```bash
node --prof src/server.js
node --prof-process isolate-*.log > profile.txt
```

### Frontend
Use Chrome DevTools Performance tab

## Database Queries
```bash
# Connect to database
psql -d digital_twin

# View slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```
