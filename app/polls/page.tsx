import { PollCard } from "../components/polls/poll-card";
import { Button } from "../components/ui/button";
import Link from "next/link";

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
    isVoted: true,
  },
];

export default function PollsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="space-y-8">
        {mockPolls.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`}>
            <div className="cursor-pointer transition-transform hover:scale-[1.01]">
              <PollCard poll={poll} />
            </div>
          </Link>
        ))}

        {mockPolls.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No polls found</p>
            <Link href="/polls/create">
              <Button>Create Your First Poll</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}