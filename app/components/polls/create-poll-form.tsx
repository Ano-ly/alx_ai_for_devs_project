'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../context/auth-context';
import { toast } from '../../components/ui/use-toast';

interface PollOption {
  id: string;
  text: string;
}

export function CreatePollForm() {
  const { user, getAuthHeader } = useAuth();
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize poll options with two empty options
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);

  // Add a new empty option to the poll
  const handleAddOption = () => {
    const newOptionId = crypto.randomUUID();
    setOptions(prevOptions => [...prevOptions, { id: newOptionId, text: '' }]);
  };

  // Remove an option if there are more than 2 options
  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(prevOptions => prevOptions.filter(option => option.id !== id));
  };

  // Update the text of a specific option
  const handleOptionChange = (id: string, text: string) => {
    setOptions(prevOptions => 
      prevOptions.map(option => option.id === id ? { ...option, text } : option)
    );
  };

  // Helper function for form validation
  const validatePollForm = (pollTitle: string, pollOptions: PollOption[]): boolean => {
    if (!pollTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a poll question",
        variant: "destructive"
      });
      return false;
    }

    const validOptions = pollOptions.filter(option => option.text.trim() !== '');
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least two poll options",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Helper function to handle poll creation API call
  const createPoll = async (pollData: any, authHeader: { Authorization?: string }) => {
    const response = await fetch('/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(pollData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create poll');
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePollForm(title, options)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const pollData = {
        title,
        description,
        options: options.filter(option => option.text.trim() !== '').map(({ text }) => ({ text })),
        createdBy: user?.id
      };

      const result = await createPoll(pollData, getAuthHeader());

      toast({
        title: "Success",
        description: "Your poll has been created"
      });

      router.push(`/polls/${result.id}`);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create poll",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
        <CardDescription>
          Fill in the details to create your poll. You need at least two options.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Poll Question</label>
            <Input
              id="title"
              placeholder="What's your favorite programming language?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
            <Input
              id="description"
              placeholder="Add more context to your question"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Poll Options</label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddOption}
              >
                Add Option
              </Button>
            </div>
            
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveOption(option.id)}
                    className="px-2"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}