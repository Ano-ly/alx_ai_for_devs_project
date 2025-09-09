import { NextResponse } from 'next/server';

// Mock data for initial development
const mockPolls = {
  "1": {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Vote for your preferred language for web development",
    options: [
      { id: "1", text: "JavaScript", votes: 42 },
      { id: "2", text: "Python", votes: 35 },
      { id: "3", text: "TypeScript", votes: 28 },
      { id: "4", text: "Java", votes: 15 },
    ],
    totalVotes: 120,
    createdBy: "John Doe",
    createdAt: "2023-05-15T10:30:00Z",
  },
  "2": {
    id: "2",
    title: "Which frontend framework do you prefer?",
    description: null,
    options: [
      { id: "1", text: "React", votes: 55 },
      { id: "2", text: "Vue", votes: 32 },
      { id: "3", text: "Angular", votes: 18 },
      { id: "4", text: "Svelte", votes: 25 },
    ],
    totalVotes: 130,
    createdBy: "Jane Smith",
    createdAt: "2023-05-10T14:20:00Z",
  },
};

// GET a specific poll
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const poll = mockPolls[id as keyof typeof mockPolls];

    if (!poll) {
      return NextResponse.json(
        { success: false, message: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ poll }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

// PUT to update a poll (e.g., vote on an option)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const poll = mockPolls[id as keyof typeof mockPolls];

    if (!poll) {
      return NextResponse.json(
        { success: false, message: 'Poll not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { optionId } = body;

    // This is a placeholder for actual vote logic
    // In a real application, you would:
    // 1. Validate the input
    // 2. Check if the user has already voted
    // 3. Update the vote count in the database

    if (!optionId) {
      return NextResponse.json(
        { success: false, message: 'Option ID is required' },
        { status: 400 }
      );
    }

    // Mock successful vote
    const updatedPoll = { ...poll };
    const optionIndex = updatedPoll.options.findIndex(
      (option: any) => option.id === optionId
    );

    if (optionIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Option not found' },
        { status: 400 }
      );
    }

    updatedPoll.options[optionIndex].votes += 1;
    updatedPoll.totalVotes += 1;

    return NextResponse.json(
      { success: true, message: 'Vote recorded successfully', poll: updatedPoll },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update poll' },
      { status: 500 }
    );
  }
}

// DELETE a poll
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const poll = mockPolls[id as keyof typeof mockPolls];

    if (!poll) {
      return NextResponse.json(
        { success: false, message: 'Poll not found' },
        { status: 404 }
      );
    }
    
    // Get user ID from request headers or cookies
    // This is a simplified version - in a real app, you'd extract this from a JWT token or session
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = authHeader.replace('Bearer ', '');
    
    // Check if the user is the creator of the poll
    if (poll.createdBy !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only delete your own polls' },
        { status: 403 }
      );
    }

    // This is a placeholder for actual deletion logic
    // In a real application, you would delete the poll from the database

    return NextResponse.json(
      { success: true, message: 'Poll deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}