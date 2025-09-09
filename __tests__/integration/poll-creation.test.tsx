import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePollForm } from '@/components/polls/create-poll-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AuthProvider } from '@/context/auth-context';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Create a wrapper component for testing with context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

describe('Poll Creation Integration', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  test('should create a poll and redirect to the poll page', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ id: 'new-poll-id' }),
    });

    // Render the component with context
    render(
      <TestWrapper>
        <CreatePollForm />
      </TestWrapper>
    );

    // Fill in the form
    const titleInput = screen.getByLabelText(/poll question/i);
    fireEvent.change(titleInput, { target: { value: 'Integration Test Poll' } });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Testing the full flow' } });

    // Fill in options
    const optionInputs = screen.getAllByPlaceholderText(/enter an option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });

    // Add another option
    const addOptionButton = screen.getByRole('button', { name: /add option/i });
    fireEvent.click(addOptionButton);

    // Fill in the new option
    const newOptionInput = screen.getAllByPlaceholderText(/enter an option/i)[2];
    fireEvent.change(newOptionInput, { target: { value: 'Option C' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create poll/i });
    fireEvent.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('Integration Test Poll'),
      }));
    });

    // Verify redirect
    expect(mockRouter.push).toHaveBeenCalledWith('/polls/new-poll-id');
  });

  test('should handle network errors during poll creation', async () => {
    // Mock network failure
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    // Render the component with context
    render(
      <TestWrapper>
        <CreatePollForm />
      </TestWrapper>
    );

    // Fill in the form with minimal valid data
    const titleInput = screen.getByLabelText(/poll question/i);
    fireEvent.change(titleInput, { target: { value: 'Error Test Poll' } });

    const optionInputs = screen.getAllByPlaceholderText(/enter an option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option X' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option Y' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create poll/i });
    fireEvent.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/failed to create poll/i)).toBeInTheDocument();
    });

    // Verify no redirect happened
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});