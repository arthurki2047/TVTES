'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Send } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  channelName: z.string().min(2, {
    message: "Channel name must be at least 2 characters.",
  }),
  additionalInfo: z.string().optional(),
});

function ChannelRequestForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelName: "",
      additionalInfo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Request Submitted!",
      description: `Thank you for requesting "${values.channelName}". We'll look into it.`,
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Channel</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="channelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., NASA TV" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the channel you'd like to see on Amar TV.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide any extra details, like a link to the stream if you have it."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


export default function ProfilePage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Profile</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <Avatar className="h-24 w-24">
            <AvatarImage src="https://picsum.photos/seed/user/200" alt="User avatar" />
            <AvatarFallback>
                <User className="h-12 w-12" />
            </AvatarFallback>
        </Avatar>
        <h3 className="mt-4 text-2xl font-semibold">User Profile</h3>
        <p className="mt-2 text-muted-foreground">
          This is where user settings and profile information will be displayed.
        </p>
      </div>

      <div className="mt-8">
        <ChannelRequestForm />
      </div>
    </div>
  );
}
