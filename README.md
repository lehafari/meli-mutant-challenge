# Mutant DNA Analyzer

## Overview
This application analyzes DNA sequences to determine if they belong to a mutant or a human. The analysis is based on finding sequences of four identical letters (A, T, C, G) in different directions (horizontal, vertical, or diagonal). If more than one such sequence is found, the DNA is classified as mutant.

## Technical Stack
- **Backend**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Docker**: Container support
- **API Documentation**: Swagger

## Features
- DNA sequence analysis (mutant detection)
- Statistical analysis of processed sequences
- REST API endpoints
- Database persistence
- Docker support
- Automated tests

## API Endpoints

### POST /mutant
Analyzes a DNA sequence to determine if it belongs to a mutant.

**Request Body:**
```json
{
  "dna": [
    "ATGCGA",
    "CAGTGC",
    "TTATGT",
    "AGAAGG",
    "CCCCTA",
    "TCACTG"
  ]
}
```

**Responses:**
- `200 OK`: DNA sequence belongs to a mutant
- `403 Forbidden`: DNA sequence belongs to a human
- `400 Bad Request`: Invalid DNA sequence

### GET /mutant/stats
Returns statistics about the analyzed DNA sequences.

**Response:**
```json
{
  "count_mutant_dna": 40,
  "count_human_dna": 100,
  "ratio": 0.4,
  "total_sequences": 140,
  "base_distribution": {
    "A": 25.5,
    "T": 24.5,
    "C": 25.0,
    "G": 25.0
  },
  "mutant_patterns": {
    "average": 2.3,
    "max": 4,
    "distribution": {
      "horizontal": 1.2,
      "vertical": 0.8,
      "diagonal": 0.3
    }
  },
  "performance": {
    "fastest_ms": 0.5,
    "slowest_ms": 2.5,
    "average_ms": 1.2
  }
}
```

## Project Structure
```
src/
├── app/
│   ├── config/         # Application configuration
│   ├── db/            # Database configuration and Prisma setup
│   └── mutants/       # Mutant detection module
│       ├── controller/
│       ├── dtos/
│       ├── interfaces/
│       └── usecases/
├── common/            # Shared utilities and exceptions
├── app.module.ts
└── main.ts
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- Yarn package manager

### Environment Setup
Create a `.env` file in the root directory:

```env
# App
NODE_ENV=development
PORT=3333
GLOBAL_PREFIX=api/v1
# Database
DATABASE_URL=postgresql://postgres:password@host:port/db
```

### Running with Docker
1. Build and start the containers:
```bash
yarn docker:build &&
yarn docker:compose
```

2. Check the application logs:
```bash
yarn docker:compose:logs
```

3. Stop the application:
```bash
docker-compose down
```

### Development Setup
1. Install dependencies:
```bash
yarn install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Start in development mode:
```bash
yarn start:dev
```

### Running Tests
```bash
# Unit tests
yarn test

# Test coverage
yarn test:cov
```

## API Documentation
When running in development mode, Swagger documentation is available at:
```
http://localhost:3333/docs
```

