'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../components/ui/use-toast';

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
  totalVotes: number;
  createdBy: string;
  createdAt: string;
}

export default function PollResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/polls/${params.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch poll');
        }
        
        setPoll(data.poll);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch poll');
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to fetch poll',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoll();
  }, [params.id]);

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
        <h1 className="text-2xl font-bold mb-4">Poll Results Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "The poll you're looking for doesn't exist or has been removed."}</p>
        <Link href="/polls">
          <Button>Back to Polls</Button>
        </Link>
      </div>
    );
  }

  // Sort options by votes (highest first)
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  
  // Find the winning option(s) - there could be a tie
  const highestVotes = sortedOptions[0]?.votes || 0;
  const winners = sortedOptions.filter(option => option.votes === highestVotes);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between items-center">
        <Link href={`/polls/${params.id}`}>
          <Button variant="outline" size="sm">
            ← Back to Poll
          </Button>
        </Link>
        
        <Link href="/polls">
          <Button variant="ghost" size="sm">
            All Polls
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Results: {poll.title}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
          <div className="text-xs text-muted-foreground mt-2">
            Created by {poll.createdBy} • {new Date(poll.createdAt).toLocaleDateString()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {poll.totalVotes === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No votes yet. Be the first to vote!
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {winners.length > 1 ? 'Tied Winners' : 'Current Leader'}
                </h3>
                
                <div className="bg-muted/30 p-4 rounded-lg border">
                  {winners.map((winner) => (
                    <div key={winner.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{winner.text}</span>
                        <span className="text-sm text-muted-foreground ml-2">({winner.votes} votes)</span>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {poll.totalVotes > 0 ? Math.round((winner.votes / poll.totalVotes) * 100) : 0}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium">All Results</h3>
                
                {sortedOptions.map((option) => {
                  const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                  const isWinner = winners.some(w => w.id === option.id);
                  
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`${isWinner ? 'font-medium' : ''}`}>{option.text}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className={`${isWinner ? 'bg-primary' : 'bg-secondary'} h-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-right">
                        {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                Total: {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter>
          <Link href={`/polls/${params.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              Back to Voting
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}