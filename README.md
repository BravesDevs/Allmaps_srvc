# Allmaps Backend

## Overview
This is the backend for the Allmaps application, a powerful roadmap generation tool built with NestJS. It handles user authentication, data management, and integration with Google's Gemini AI to generate learning roadmaps.

## Architecture

The backend follows a modular architecture using NestJS, Prisma for ORM, and integrates with Google Gemini for AI capabilities.

```mermaid
graph TD
    %% Nodes
    Client[Frontend Client]
    
    subgraph "NestJS Backend"
        Controller[API Controller]
        Auth[Auth Module]
        RoadmapService[Roadmap Service]
        GeminiService[Gemini AI Service]
        Prisma[Prisma Service]
    end
    
    Database[(MariaDB Database)]
    GeminiAI((Google Gemini AI))

    %% Styles using Gemini colors roughly
    style GeminiAI fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff
    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style Database fill:#eee,stroke:#333,stroke-width:2px

    %% Flow
    Client -- "HTTP Requests (JWT)" --> Controller
    Controller -- "Guards" --> Auth
    Controller -- "Request Roadmap" --> RoadmapService
    
    RoadmapService -- "Generate Content" --> GeminiService
    GeminiService -- "Prompt" --> GeminiAI
    GeminiAI -- "AI Response" --> GeminiService
    
    RoadmapService -- "Store/Retrieve" --> Prisma
    Prisma -- SQL Queries --> Database
```

## Tech Stack
- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: MariaDB (via [Prisma ORM](https://www.prisma.io/))
- **AI**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (via `@google/generative-ai`)
- **Authentication**: JWT, Passport, Bcrypt
- **Documentation**: Swagger (OpenAPI)

## Key Modules
1.  **Auth Module**: Handles user registration, login, and JWT strategy.
2.  **Gemini Module**: Interfaces with Google's Generative AI to create roadmaps.
3.  **Roadmap Module**: Manages roadmap data, interacts with Gemini Service for generation, and Prisma for storage.
4.  **Prisma Module**: Global module for database connection.

## Setup & Running

### Prerequisites
- Node.js (v18+)
- MariaDB Database
- Google Gemini API Key

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory (refer to `.env.example` if available) and configure:
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/allmaps_db"
    JWT_SECRET="your_jwt_secret"
    GEMINI_API_KEY="your_gemini_api_key"
    ```

3.  **Database Setup:**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## API Documentation
Once the server is running, visit `http://localhost:3000/api` to view the Swagger API documentation.
