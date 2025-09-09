// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the toast functionality
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the auth context
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', name: 'Test User' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }) => children,
}));

// Setup fetch mock
global.fetch = jest.fn();

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});