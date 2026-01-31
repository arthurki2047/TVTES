'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw } from "lucide-react";
import { generateStreamKey } from "@/app/(main)/profile/actions";
import { useToast } from "@/hooks/use-toast";

interface StreamKeyManagerProps {
  initialStreamKey: string;
}

export function StreamKeyManager({ initialStreamKey }: StreamKeyManagerProps) {
  const [streamKey, setStreamKey] = useState(initialStreamKey);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(streamKey);
      toast({
        title: "Copied to clipboard!",
        description: "Your stream key has been copied.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy the key to your clipboard.",
      });
    }
  };

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const newKey = await generateStreamKey();
        setStreamKey(newKey);
        toast({
          title: "New key generated!",
          description: "Your stream key has been refreshed.",
        });
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Generation failed",
          description: "Could not generate a new stream key.",
        });
      }
    });
  };

  return (
    <div className="mt-8 rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-bold font-headline mb-4">Your Stream Key</h2>
      <p className="text-muted-foreground mb-4">
          Use this key in your broadcasting software to stream to your channel.
          Keep it secret!
      </p>
      <div className="flex gap-2">
          <Input readOnly value={streamKey} className="text-lg bg-input" />
          <Button onClick={handleCopy} size="icon" variant="outline">
              <Copy className="h-5 w-5" />
              <span className="sr-only">Copy Stream Key</span>
          </Button>
          <Button onClick={handleRefresh} disabled={isPending} size="icon" variant="outline">
              <RefreshCw className={`h-5 w-5 ${isPending ? 'animate-spin' : ''}`} />
              <span className="sr-only">Generate New Key</span>
          </Button>
      </div>
    </div>
  );
}
