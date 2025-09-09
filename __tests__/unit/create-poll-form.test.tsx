import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePollForm } from '@/components/polls/create-poll-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/components/ui/use-toast';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

describe('CreatePollForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockAuthContext = {
    user: { id: 'test-user-id' },
    getAuthHeader: jest.fn().mockReturnValue({ 'Authorization': 'Bearer test-token' }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuthContext);
  });

  test('should validate form and show error when title is empty', async () => {
    // Arrange
    render(<CreatePollForm />);
    const submitButton = screen.getByRole('button', { name: /create poll/i });

    // Act
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Please enter a poll question",
        variant: "destructive"
      });
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('should validate form and show error when less than 2 options are provided', async () => {
    // Arrange
    render(<CreatePollForm />);
    
    // Fill in title but leave options empty
    const titleInput = screen.getByLabelText(/poll question/i);
    fireEvent.change(titleInput, { target: { value: 'Test Poll Question' } });
    
    const submitButton = screen.getByRole('button', { name: /create poll/i });

    // Act
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Please provide at least two poll options",
        variant: "destructive"
      });
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('should submit form successfully when all fields are valid', async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ id: 'new-poll-id' }),
    });

    render(<CreatePollForm />);
    
    // Fill in title
    const titleInput = screen.getByLabelText(/poll question/i);
    fireEvent.change(titleInput, { target: { value: 'Test Poll Question' } });
    
    // Fill in options
    const optionInputs = screen.getAllByPlaceholderText(/enter an option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option 2' } });
    
    const submitButton = screen.getByRole('button', { name: /create poll/i });

    // Act
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          title: 'Test Poll Question',
          description: '',
          options: [
            { text: 'Option 1' },
            { text: 'Option 2' }
          ],
          createdBy: 'test-user-id'
        })
      });
    });
    
    expect(toast).toHaveBeenCalledWith({
      title: "Success",
      description: "Your poll has been created"
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith('/polls/new-poll-id');
  });
});