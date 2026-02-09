'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Send, PlayCircle } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";

function RequestChannelCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Channel</CardTitle>
        <CardDescription>
          Have a channel you'd like to see added? Let us know by filling out our request form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="https://forms.gle/avRKxHU8ujE1JMC78" target="_blank" rel="noopener noreferrer">
            <Send className="mr-2 h-4 w-4" />
            Open Request Form
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}


const testStreamFormSchema = z.object({
  streamUrl: z.string().url({ message: "Please enter a valid stream URL." }),
  streamType: z.enum(['hls', 'mp4', 'iframe'], {
    required_error: "You need to select a stream type.",
  }),
});

function TestStreamForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof testStreamFormSchema>>({
    resolver: zodResolver(testStreamFormSchema),
    defaultValues: {
      streamUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof testStreamFormSchema>) {
    const { streamUrl, streamType } = values;
    const query = new URLSearchParams({
        url: streamUrl,
        type: streamType,
        name: 'Test Stream',
    });
    router.push(`/watch/test?${query.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test a Stream</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="streamUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/stream.m3u8" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the URL of the HLS, MP4, or Iframe stream you want to test.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="streamType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Stream Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="hls" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">HLS (.m3u8)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="mp4" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">MP4</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="iframe" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Iframe</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Test Stream
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

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <TestStreamForm />
        <RequestChannelCard />
      </div>
    </div>
  );
}
