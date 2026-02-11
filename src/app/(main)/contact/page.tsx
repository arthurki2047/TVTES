'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="container py-6">
        <h1 className="mb-6 font-headline text-4xl font-bold">Contact Us</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
                <h2 className="font-headline text-2xl font-bold">We’d love to hear from you!</h2>
                <p className="text-muted-foreground">
                    Whether you have questions, feedback, or wish to report an issue, the Amar TV team is here to help.
                </p>
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>📌 Please note:</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                            <li>
                                We do not host or stream any content directly. All channels and streams are aggregated from publicly available third-party sources.
                            </li>
                            <li>
                                If you are a copyright holder and believe your content appears on our website without authorization, please send us a detailed DMCA request via this page. We will review and take appropriate action.
                            </li>
                            <li>
                                For general inquiries, suggestions, or technical issues, feel free to reach out and we’ll get back to you as soon as possible.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground mb-4">
                        To get in touch with us, please fill out our contact form. Your feedback is important to us!
                    </p>
                    <Button asChild className="w-full">
                        <Link href="https://forms.gle/tQg8vgeruYjJn7dp6" target="_blank" rel="noopener noreferrer">
                            <Send className="mr-2 h-4 w-4" />
                            Open Contact Form
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
        </div>
    );
}
