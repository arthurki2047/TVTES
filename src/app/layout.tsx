import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { VideoPlayerProvider } from '@/context/video-player-context';
import { NoticeBoard } from '@/components/notice-board';
import { ptSans, playfairDisplay } from './fonts';

export const metadata: Metadata = {
  title: 'Amar TV',
  description: 'A modern live TV streaming web application.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn('font-body antialiased bg-gradient-indian-flag bg-fixed', ptSans.variable, playfairDisplay.variable)}>
        <NoticeBoard />
        <VideoPlayerProvider>
          {children}
        </VideoPlayerProvider>
        <Toaster />
      </body>
    </html>
  );
}
