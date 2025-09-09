import { NextResponse } from 'next/server';

// Mock data for initial development
const mockPolls = [
  {
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
  {
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
];

// GET all polls
export async function GET() {
  try {
    // In a real application, you would fetch polls from a database
    return NextResponse.json({ polls: mockPolls }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}

// POST to create a new poll
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, options, createdBy } = body;

    // This is a placeholder for actual poll creation logic
    // In a real application, you would:
    // 1. Validate the input
    // 2. Store the poll in a database
    // 3. Return the created poll

    if (!title || !options || options.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Invalid poll data' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Mock successful poll creation
    const newPoll = {
      id: (mockPolls.length + 1).toString(),
      title,
      description,
      options: options.map((option: { text: string }, index: number) => ({
        id: (index + 1).toString(),
        text: option.text,
        votes: 0,
      })),
      totalVotes: 0,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, message: 'Poll created successfully', poll: newPoll },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create poll' },
      { status: 500 }
    );
  }
}