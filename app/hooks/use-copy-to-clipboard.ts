import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: "The poll link has been copied to your clipboard.",
      });
      // Reset isCopied after a short delay
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setIsCopied(false);
      toast({
        title: "Failed to Copy",
        description: "Could not copy the link. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to copy: ', err);
    }
  };

  return [isCopied, copy];
}