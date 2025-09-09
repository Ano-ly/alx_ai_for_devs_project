# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Testing
```bash
npm test             # Run all Jest tests
npm run test:watch   # Run tests in watch mode

# Run specific test types
npm test __tests__/unit/           # Unit tests only
npm test __tests__/integration/    # Integration tests only

# Run single test file
npm test create-poll-form.test.tsx
```

## Architecture Overview

This is a **Next.js 15 App Router** polling application with the following architecture:

### Core Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context for authentication
- **Testing**: Jest with Testing Library and jsdom environment

### Key Architectural Patterns

1. **Authentication Context Pattern**: 
   - `app/context/auth-context.tsx` provides global auth state
   - Uses localStorage for simple token/user persistence
   - Provides `getAuthHeader()` helper for API calls

2. **Component Structure**:
   - UI components in `app/components/ui/` (shadcn/ui)
   - Feature components in `app/components/[feature]/`
   - Layout components in `app/components/layout/`

3. **API Structure**:
   - RESTful API routes in `app/api/`
   - Mock data implementation (ready for database integration)
   - Standard Next.js route handlers with proper error responses

4. **Testing Strategy**:
   - Unit tests for individual components
   - Integration tests for full user flows
   - Mocked dependencies with comprehensive setup in `jest.setup.js`

### Directory Structure Logic
```
app/
├── api/                    # API route handlers
│   ├── auth/              # Authentication endpoints
│   └── polls/             # Poll CRUD operations
├── components/            # React components
│   ├── auth/             # Auth-related components
│   ├── layout/           # Layout components (navbar, etc.)
│   ├── polls/            # Poll-specific components
│   └── ui/               # Reusable UI components (shadcn/ui)
├── context/              # React contexts
├── lib/                  # Utility functions
├── polls/                # Poll-related pages
└── auth/                 # Authentication pages
```

### State Management Patterns
- Authentication state via React Context
- Form state with local useState
- Mock data in API routes (ready for database integration)

### Key Configuration Files
- `components.json`: shadcn/ui configuration with path aliases
- `tsconfig.json`: TypeScript with path mapping (`@/*` → `./`)
- `jest.config.js`: Custom module mapping for tests (`@/` → `<rootDir>/app/`)

### Testing Architecture
- **Unit Tests**: Individual component behavior and validation
- **Integration Tests**: Full user flows with mocked API calls
- **Mocking Strategy**: Comprehensive mocks in `jest.setup.js` for auth, toast, and fetch
- **Test Utilities**: Testing Library with custom wrappers for context providers

### Current Implementation Notes
- Uses mock data in API routes - ready for database integration
- Simple localStorage-based auth - production apps should use secure tokens
- shadcn/ui components with Tailwind CSS for styling
- Form validation with user-friendly error messages via toast notifications

### Adding New Features
1. **New API Endpoints**: Add to `app/api/[feature]/route.ts`
2. **New Components**: Follow existing patterns in `app/components/`
3. **New Pages**: Use App Router structure in `app/`
4. **New Tests**: Add unit tests in `__tests__/unit/`, integration tests in `__tests__/integration/`

### Development Workflow
- Components use TypeScript with proper typing
- Forms include validation and error handling
- API calls use the auth context's `getAuthHeader()` helper
- Tests mock all external dependencies for isolated testing
