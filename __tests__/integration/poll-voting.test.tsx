import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import PollPage from '@/app/polls/[id]/page';
import { AuthProvider } from '@/context/auth-context';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Create a wrapper component for testing with context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

describe('Poll Voting Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  const mockPoll = {
    id: 'test-poll-id',
    title: 'Test Poll Question',
    description: 'This is a test poll',
    options: [
      { id: '1', text: 'Option A', votes: 5 },
      { id: '2', text: 'Option B', votes: 10 },
      { id: '3', text: 'Option C', votes: 3 },
    ],
    totalVotes: 18,
    createdBy: 'Test User',
    createdAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'test-poll-id' });
    
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  test('should load poll details and submit a vote', async () => {
    // Mock API responses
    (global.fetch as jest.Mock)
      // First call - fetching poll details
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ poll: mockPoll }),
      })
      // Second call - submitting vote
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          poll: {
            ...mockPoll,
            options: [
              { id: '1', text: 'Option A', votes: 6 }, // Vote added to Option A
              { id: '2', text: 'Option B', votes: 10 },
              { id: '3', text: 'Option C', votes: 3 },
            ],
            totalVotes: 19,
          },
        }),
      });

    // Render the poll page
    render(
      <TestWrapper>
        <PollPage params={{ id: 'test-poll-id' }} />
      </TestWrapper>
    );

    // Wait for poll to load
    await waitFor(() => {
      expect(screen.getByText('Test Poll Question')).toBeInTheDocument();
    });

    // Verify poll options are displayed
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();

    // Select an option and vote
    const optionARadio = screen.getByLabelText('Option A');
    fireEvent.click(optionARadio);

    const voteButton = screen.getByRole('button', { name: /vote/i });
    fireEvent.click(voteButton);

    // Verify API call for voting
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/polls/test-poll-id', expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ optionId: '1' }),
      }));
    });

    // Verify results are displayed after voting
    await waitFor(() => {
      expect(screen.getByText('Thank you for voting!')).toBeInTheDocument();
    });

    // Verify vote percentages are displayed
    await waitFor(() => {
      // Option A should now have 6/19 votes = ~32%
      const percentages = screen.getAllByText(/\d+%/);
      expect(percentages.some(el => el.textContent === '32%')).toBeTruthy();
    });
  });

  test('should handle errors when loading poll data', async () => {
    // Mock API error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ message: 'Poll not found' }),
    });

    // Render the poll page
    render(
      <TestWrapper>
        <PollPage params={{ id: 'invalid-poll-id' }} />
      </TestWrapper>
    );

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch poll/i)).toBeInTheDocument();
    });

    // Verify no voting UI is shown
    expect(screen.queryByRole('button', { name: /vote/i })).not.toBeInTheDocument();
  });
});