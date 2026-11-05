# MyNote

**An AI-powered personal knowledge management system with semantic search.**

MyNote is a backend-focused application that allows users to create, manage, and retrieve personal notes using natural-language queries. It uses OpenAI embeddings and PostgreSQL with pgvector to find semantically relevant information rather than relying only on keyword matching.

## Features

- **Authentication:** User registration and login using JWT authentication.
- **Notes Management:** Create, read, update, and delete personal notes.
- **Semantic Search:** Search personal knowledge using natural-language queries.
- **AI Guardrails:** Validate whether a search query is relevant to personal note retrieval.
- **Vector Search:** Retrieve relevant notes using PostgreSQL and pgvector.
- **AI Reranking:** Improve search relevance by reranking retrieved candidates.
- **Background Processing:** Generate note embeddings asynchronously using BullMQ and Redis.
- **Observability:** Monitor application performance with Grafana and Prometheus, and AI operations with Langfuse.

## Technology Stack

| Category | Technology |
|---|---|
| Backend | NestJS, Node.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Vector Search | pgvector |
| Authentication | JWT, Passport, Argon2 |
| AI / LLM | OpenAI API |
| Embeddings | text-embedding-3-small |
| Background Jobs | BullMQ |
| Queue Storage | Redis |
| API Monitoring | Prometheus |
| Dashboards | Grafana |
| AI Observability | Langfuse |
| Metrics Client | prom-client |

## Architecture

```text
                    Client
                      |
                      v
                NestJS Backend
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       Auth        Notes       Search
          |           |           |
          v           v           v
        JWT       PostgreSQL   AI Guardrail
                      |           |
                      v           v
                   BullMQ     Query Embedding
                      |           |
                      v           v
                    Redis     pgvector Search
                      |           |
                      v           v
                 Embeddings   Candidate Notes
                  Processor       |
                      |           v
                      v        Reranking
                   OpenAI         |
                      |           v
                      v       Search Results
                PostgreSQL
```

## How It Works

### 1. Authentication

Users register and log in to access their personal notes.

- Passwords are hashed using Argon2.
- JWT tokens authenticate protected API requests.
- Users can only access their own notes.

### 2. Note Management

Users can create, retrieve, update, and delete notes.

Notes are stored in PostgreSQL through Prisma.

### 3. Background Embedding Generation

Whenever a note is created or updated:

1. The note is saved in PostgreSQL.
2. A background job is added to BullMQ.
3. Redis stores the pending job.
4. The embedding processor retrieves the latest note.
5. OpenAI generates its embedding using `text-embedding-3-small`.
6. The resulting 1536-dimensional vector is stored in PostgreSQL using pgvector.

This keeps embedding generation separate from the user's note creation request.

### 4. Semantic Search

When a user submits a natural-language query:

1. **Guardrail:** An LLM checks whether the query is relevant to personal note retrieval.
2. **Query Embedding:** OpenAI generates an embedding for the query.
3. **Vector Retrieval:** pgvector performs similarity search against the user's notes.
4. **Candidate Selection:** The application retrieves up to 20 candidate notes.
5. **Reranking:** An LLM evaluates the candidates and selects the most relevant results.
6. **Response:** The application returns up to 5 ranked notes.

The search workflow is synchronous. BullMQ is used for note embedding generation, not for search requests.

## Project Structure

```text
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   └── guards/
│
├── notes/
│   ├── notes.controller.ts
│   └── notes.service.ts
│
├── search/
│   ├── search.controller.ts
│   └── search.service.ts
│
├── embeddings/
│   └── embeddings.processor.ts
│
├── metrics/
│   ├── metrics.controller.ts
│   ├── metrics.service.ts
│   ├── metrics.interceptor.ts
│   └── metrics.module.ts
│
├── prisma/
├── app.module.ts
├── main.ts
└── instrumentation.ts
```

*The structure above represents the main application modules; individual DTOs, configuration files, generated Prisma files, and other supporting files are omitted.*

## API Endpoints

Base URL: `http://localhost:4000`

### Authentication

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/auth/register` | Register a user | No |
| POST | `/auth/login` | Authenticate a user | No |
| GET | `/auth/me` | Get authenticated user | Yes |

### Notes

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/notes` | Create a note | Yes |
| GET | `/notes` | List notes | Yes |
| GET | `/notes/:id` | Get a note | Yes |
| PATCH | `/notes/:id` | Update a note | Yes |
| DELETE | `/notes/:id` | Delete a note | Yes |

### Semantic Search

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/search` | Search personal notes using AI | Yes |

Example request:

```json
{
  "query": "Which database and vector search technology does MyNote use?"
}
```

Include the JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Metrics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/metrics` | Expose Prometheus metrics |

## Local Development Setup

### Prerequisites

Install the following:

- Node.js 22+
- PostgreSQL
- Redis
- Docker
- OpenAI API key

PostgreSQL must have the pgvector extension installed.

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd mynote
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
# Application
PORT=4000

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mynote_db"

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Langfuse
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_BASE_URL=http://localhost:3200
```

Use your actual database credentials and API keys.

### 4. Set up the database

Ensure PostgreSQL is running and the pgvector extension is available.

Apply your Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start Redis

Ensure Redis is running on port 6379.

Check its availability:

```bash
redis-cli ping
```

Expected response:

```text
PONG
```

### 6. Start the application

```bash
npm run start:dev
```

The backend will be available at:

```text
http://localhost:4000
```

## Observability

MyNote uses two observability systems for different purposes.

### Grafana + Prometheus

Prometheus collects application metrics, while Grafana provides dashboards and visualizations.

Monitored metrics include:

- Total HTTP requests.
- Requests per second.
- API response time.
- P50, P95 and P99 latency.
- HTTP error rates.
- Node.js runtime metrics.

Local URLs:

| Service | URL |
|---|---|
| Grafana | http://localhost:3100 |
| Prometheus | http://localhost:9092 |
| MyNote Metrics | http://localhost:4000/metrics |

Example PromQL queries:

Requests per second:

```promql
sum(rate(mynote_http_requests_total[1m]))
```

P95 latency:

```promql
histogram_quantile(
  0.95,
  sum by (le, route) (
    rate(mynote_http_request_duration_seconds_bucket[5m])
  )
)
```

HTTP 5xx error percentage:

```promql
(
  sum(rate(mynote_http_requests_total{status_code=~"5.."}[5m]))
  /
  sum(rate(mynote_http_requests_total[5m]))
) * 100
```

### Langfuse

Langfuse provides observability for AI operations.

It helps inspect:

- OpenAI model calls.
- Prompt inputs and model outputs.
- Embedding generation.
- Token usage.
- Model execution latency.
- Estimated AI costs when pricing information is available.

Local URL:

```text
http://localhost:3200
```

## Background Processing

BullMQ and Redis handle asynchronous embedding generation.

This architecture separates note creation from the more expensive embedding operation.

Benefits:

- Faster note creation responses.
- Asynchronous AI processing.
- Retry support for failed jobs.
- Better separation of application responsibilities.

## Search Architecture

MyNote uses PostgreSQL with pgvector instead of a separate vector database.

The embedding model generates 1536-dimensional vectors, which are stored alongside note references.

Vector similarity retrieves relevant candidates, and an LLM-based reranking stage improves their ordering.

All retrieval operations are scoped to the authenticated user's notes.

## Future Improvements

- Next.js frontend.
- Search filters and pagination.
- Improved retrieval and reranking evaluation.
- Automated unit and integration tests.
- Rate limiting and additional security controls.
- Custom Langfuse spans for detailed end-to-end tracing.
- Production Docker configuration.
- CI/CD pipeline.
- Production deployment.

## License

Add your preferred open-source license before publishing the repository.