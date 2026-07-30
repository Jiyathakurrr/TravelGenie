# Deployment Strategy & CI/CD

This document outlines how TravelGenie is tested, built, and deployed to production.

## Git Branch Strategy

We follow a simplified GitFlow model tailored for a small, fast-moving team.

```mermaid
gitGraph
    commit id: "Initial Commit"
    branch develop
    checkout develop
    commit id: "Setup boilerplate"
    branch feature/chatbot
    checkout feature/chatbot
    commit id: "Add OpenAI integration"
    commit id: "Fix JSON parsing"
    checkout develop
    merge feature/chatbot
    branch bugfix/booking-error
    checkout bugfix/booking-error
    commit id: "Fix inline error display"
    checkout develop
    merge bugfix/booking-error
    checkout main
    merge develop id: "Release v1.0.0" tag: "v1.0.0"
```

## Deployment Flow

```mermaid
graph LR
    Developer[Developer Push] --> GitHub[GitHub Repo]
    GitHub -->|Trigger| Actions[GitHub Actions CI]
    Actions -->|Run Tests| Lint[Lint & Unit Tests]
    Lint -->|Pass| Vercel[Vercel Frontend Deployment]
    Lint -->|Pass| Render[Render Backend Deployment]
    Vercel --> ProdWeb[Production Web App]
    Render --> ProdAPI[Production API]
```

## Deployment Checklist

Before merging `develop` into `main` for a release, ensure the following checklist is completed:

- [ ] **Tests Passing:** All GitHub Actions workflows are green.
- [ ] **Environment Variables:** All required production keys (OpenAI, Supabase) are securely set in Vercel and Render dashboards.
- [ ] **Database Migrations:** Any new Supabase tables, views, or RLS policies have been applied to the production database instance.
- [ ] **Mock Data:** Ensure the mock JSON files (for the MVP budget module) are accessible by the production backend environment.
- [ ] **Performance Audit:** Run Lighthouse on the staging deployment to ensure UX/UI guidelines are met.

## Hosting Platforms
- **Frontend:** Vercel (Automatic deployments via GitHub integration on `main` branch).
- **Backend:** Render (Web Service linked to the GitHub repository, deploying on `main` branch).
- **Database:** Supabase Cloud.
