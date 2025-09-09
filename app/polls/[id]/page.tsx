'use client';

import { PollCard, Poll } from "../../components/polls/poll-card";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import { useState, useEffect, useCallback } from 'react';

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

import { useToast } from '../../components/ui/use-toast';

export default function PollDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoll = useCallback(async () => {
    try {
      const response = await fetch(`/api/polls/${params.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch poll');
      }
      setPoll(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch poll');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Poll Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "The poll you're looking for doesn't exist or has been removed."}</p>
        <Link href="/polls">
          <Button>Back to Polls</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/polls">
          <Button variant="outline" size="sm">
            ← Back to Polls
          </Button>
        </Link>
      </div>

      <PollCard poll={poll} />

      <div className="mt-8 flex justify-end">
        <Link href={`/polls/${params.id}/results`}>
          <Button variant="outline">View Detailed Results</Button>
        </Link>
      </div>
    </div>
  );
}