# Style Guide

This document outlines the visual and architectural styling rules for TravelGenie.

## Frontend UI/UX Principles
*Please refer to [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) for detailed UX workflows and accessibility standards.*

## CSS Framework
We use **Tailwind CSS** for all styling.
- **Do not** write custom CSS unless absolutely necessary (e.g., complex animations not supported by Tailwind).
- Use utility classes directly in the React components.
- Group related Tailwind classes for readability (e.g., layout classes, then typography, then colors).

## Prettier & ESLint
- **Prettier** is configured to handle code formatting (quotes, indentation, trailing commas).
  - Indent: 2 spaces
  - Single quotes for TS/JS files
  - Semi-colons required
- **ESLint** enforces code quality.
  - No unused variables.
  - React Hooks exhaustive deps rule is enforced.

## Folder Structure within `/frontend`
- `/components`: Reusable UI elements (Buttons, Cards, Inputs).
- `/app`: Next.js App Router pages and layouts.
- `/lib`: Utility functions and shared helpers.
- `/hooks`: Custom React hooks.
- `/types`: TypeScript interfaces and type definitions.

## Backend Architecture
- **Controllers**: Handle HTTP request/response logic.
- **Services**: Contain the core business logic (e.g., communicating with the AI chatbot, accessing the DB).
- **Routes**: Define the API endpoints and map them to controllers.
- **Middlewares**: Handle authentication, logging, and error handling.
