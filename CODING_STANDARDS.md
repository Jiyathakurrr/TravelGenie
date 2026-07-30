# Coding Standards & Developer Notes

This document provides conventions that all developers must follow to maintain a clean and understandable codebase.

## 1. Naming Conventions

### Folder Naming
- Use **kebab-case** for all folder names.
  - Example: `trip-planning-engine`, `budget-comparison`
- Exclude capital letters.

### Component Naming (Frontend)
- Use **PascalCase** for React components and their filenames.
  - Example: `ItineraryCard.tsx`, `ChatbotInterface.tsx`
- Suffix component files with `.tsx`.

### File Naming (Backend & Utils)
- Use **camelCase** for utility files, services, and controllers.
  - Example: `itineraryService.ts`, `authController.ts`

## 2. Git Conventions

### Branch Naming Strategy
Use the following prefixes for branches:
- `feature/` - For new features (e.g., `feature/ai-chatbot`)
- `bugfix/` - For bug fixes (e.g., `bugfix/login-crash`)
- `hotfix/` - For urgent fixes on production (e.g., `hotfix/db-connection`)
- `chore/` - For maintenance tasks (e.g., `chore/update-dependencies`)
- `docs/` - For documentation updates (e.g., `docs/api-spec`)

### Commit Naming Convention
We follow conventional commits format:
`<type>[optional scope]: <description>`

**Allowed Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
- `feat(chatbot): add intent parsing for itinerary updates`
- `fix(booking): prevent app crash when flight is unavailable`
- `docs: update database schema diagram`

## 3. General Development Rules
- **TypeScript:** Use strict typing. Avoid `any` at all costs; use `unknown` if a type is truly dynamic, and type-guard it.
- **Comments:** Comment the *why*, not the *what*. Code should be self-documenting as much as possible.
- **Error Handling:** Never swallow errors. Always log them appropriately and return standard HTTP error codes to the client. Inline errors must be shown for booking failures (no abrupt redirects).
