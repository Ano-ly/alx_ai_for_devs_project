'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth'; // Assuming you have an auth hook
import { useCopyToClipboard } from '@/app/hooks/use-copy-to-clipboard';
import Link from "next/link";
import { Poll } from "../../components/polls/poll-card";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  createdBy?: string;
  createdAt: string;
}

export default function PollDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [isCopied, copyLink] = useCopyToClipboard();

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
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load poll.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  const handleVote = async (optionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/polls/${params.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ optionId, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cast vote');
      }

      toast({
        title: "Vote Cast",
        description: "Your vote has been recorded.",
      });
      fetchPoll(); // Refresh poll data after voting
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to cast vote.",
        variant: "destructive",
      });
      console.error('Error casting vote:', err);
    }
  };

  const pollUrl = typeof window !== 'undefined' ? window.location.href : '';

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

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">{poll.title}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
          <div className="text-xs text-muted-foreground mt-2">
            Created by {poll.createdBy} • {new Date(poll.createdAt).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer"
                >
                  {option.text}
                </label>
                <Button onClick={() => handleVote(option.id)} disabled={!user} className="ml-4">
                  Vote
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button onClick={() => copyLink(pollUrl)} variant="outline">
            {isCopied ? 'Copied!' : 'Copy Link'}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 flex justify-end">
        <Link href={`/polls/${params.id}/results`}>
          <Button variant="outline">View Detailed Results</Button>
        </Link>
      </div>
    </div>
  );
}