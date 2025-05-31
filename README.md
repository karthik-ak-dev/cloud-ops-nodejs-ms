# Todo Microservice

A complete Express.js based Todo microservice with PostgreSQL for storage, Redis for caching, and AWS Secrets Manager integration.

## Features

- RESTful API for todo management
- User authentication with JWT
- PostgreSQL database for data persistence
- Redis caching for improved performance
- AWS Secrets Manager integration for secure configuration
- Docker containerization for easy deployment
- TypeScript for type safety

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- AWS account (for Secrets Manager integration)

## Getting Started

### Setting up environment variables

Create a `.env` file in the root directory based on the provided values:

```
# Node environment
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h

# AWS
AWS_REGION=us-east-1
AWS_SECRET_NAME=todo-service/secrets
```

### Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

### Docker Setup

1. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Todos

- `GET /api/todos` - Get all todos for the authenticated user
- `GET /api/todos/:id` - Get a specific todo by ID
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completed status

### Health Check

- `GET /api/health` - Check service health

## AWS Secrets Manager Setup

1. Create a secret in AWS Secrets Manager with the following structure:
   ```json
   {
     "dbHost": "your-db-host",
     "dbPort": 5432,
     "dbName": "todo_db",
     "dbUser": "postgres",
     "dbPassword": "your-secure-password",
     "redisHost": "your-redis-host",
     "redisPort": 6379,
     "redisPassword": "your-redis-password",
     "jwtSecret": "your-jwt-secret"
   }
   ```

2. Make sure your AWS credentials are properly configured to access the secret.

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Service layer
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Entry point
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration
├── package.json          # NPM package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## License

ISC
