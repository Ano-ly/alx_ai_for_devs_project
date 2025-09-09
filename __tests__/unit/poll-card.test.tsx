import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PollCard } from '@/components/polls/poll-card';
import { useToast } from '@/components/ui/use-toast';

// Mock the dependencies
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('PollCard', () => {
  const mockToast = {
    toast: jest.fn(),
  };

  const mockPollProps = {
    id: 'test-poll-id',
    title: 'Test Poll',
    description: 'Test Description',
    options: [
      { id: '1', text: 'Option 1', votes: 5 },
      { id: '2', text: 'Option 2', votes: 10 },
    ],
    totalVotes: 15,
    createdBy: 'Test User',
    createdAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    global.fetch = jest.fn();
  });

  test('should render poll details correctly', () => {
    // Arrange & Act
    render(<PollCard {...mockPollProps} />);
    
    // Assert
    expect(screen.getByText('Test Poll')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('15 votes')).toBeInTheDocument();
    expect(screen.getByText(/Created by Test User/)).toBeInTheDocument();
  });

  test('should handle voting successfully', async () => {
    // Arrange
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        poll: {
          ...mockPollProps,
          options: [
            { id: '1', text: 'Option 1', votes: 6 },
            { id: '2', text: 'Option 2', votes: 10 },
          ],
          totalVotes: 16,
        },
      }),
    });

    render(<PollCard {...mockPollProps} />);
    
    // Select an option
    const option1Radio = screen.getByLabelText('Option 1');
    fireEvent.click(option1Radio);
    
    // Submit vote
    const voteButton = screen.getByRole('button', { name: /vote/i });
    fireEvent.click(voteButton);
    
    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/polls/test-poll-id`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId: '1' }),
      });
    });
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success!',
        description: 'Your vote has been recorded.',
        duration: 3000,
      });
    });
    
    // Check that the UI updates to show results
    await waitFor(() => {
      expect(screen.getByText('Thank you for voting!')).toBeInTheDocument();
    });
  });

  test('should handle voting error', async () => {
    // Arrange
    const errorMessage = 'Failed to submit vote';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ message: errorMessage }),
    });

    render(<PollCard {...mockPollProps} />);
    
    // Select an option
    const option1Radio = screen.getByLabelText('Option 1');
    fireEvent.click(option1Radio);
    
    // Submit vote
    const voteButton = screen.getByRole('button', { name: /vote/i });
    fireEvent.click(voteButton);
    
    // Assert
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    });
    
    // Check that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});