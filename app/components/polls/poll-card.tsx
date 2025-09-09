'use client';

import { useState, useEffect, forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string | null;
  options: PollOption[];
  totalVotes: number;
  createdBy: string;
  createdAt: string;
  isVoted?: boolean;
}

interface PollCardProps {
  poll: Poll;
}

export const PollCard = forwardRef<HTMLDivElement, PollCardProps>(({ poll }, ref) => {
  const { id, title, description, options, totalVotes, createdBy, createdAt, isVoted = false } = poll;
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(isVoted);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pollOptions, setPollOptions] = useState(options);
  const [pollTotalVotes, setPollTotalVotes] = useState(totalVotes);
  
  const handleVote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent event from bubbling up to the Link component
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/polls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId: selectedOption }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit vote');
      }
      
      setVoted(true);
      toast({
        title: 'Success!',
        description: 'Your vote has been recorded.',
        duration: 3000,
      });
      
      // Update the poll data with the new votes
      if (data.poll) {
        // Update options and totalVotes with the new data
        setPollOptions(data.poll.options);
        setPollTotalVotes(data.poll.totalVotes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit vote',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card ref={ref} className="w-full max-w-2xl mx-auto hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="text-xs text-muted-foreground mt-2">
          Created by {createdBy} • {new Date(createdAt).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {pollOptions.map((option) => {
            const percentage = pollTotalVotes > 0 ? Math.round((option.votes / pollTotalVotes) * 100) : 0;
            
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  {!voted ? (
                    <input
                      type="radio"
                      id={option.id}
                      name={`poll-${id}`}
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                      className="h-4 w-4"
                    />
                  ) : null}
                  <label 
                    htmlFor={option.id} 
                    className={`flex-1 ${!voted ? 'cursor-pointer' : ''}`}
                  >
                    {option.text}
                  </label>
                  {voted && <span className="text-sm font-medium">{percentage}%</span>}
                </div>
                
                {voted && (
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {pollTotalVotes} {pollTotalVotes === 1 ? 'vote' : 'votes'}
        </div>
      </CardContent>
      
      {!voted && (
        <CardFooter className="flex flex-col gap-2">
          {error && (
            <div className="text-sm text-red-500 mb-2">{error}</div>
          )}
          <Button 
            onClick={handleVote} 
            disabled={!selectedOption || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Vote'}
          </Button>
        </CardFooter>
      )}
      
      {voted && (
        <CardFooter>
          <div className="text-center w-full text-green-600 font-medium">
            Thank you for voting!
          </div>
        </CardFooter>
      )}
    </Card>
  );
});