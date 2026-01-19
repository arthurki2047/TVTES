import { BottomNav } from '@/components/bottom-nav';
import { SiteHeader } from '@/components/site-header';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <BottomNav />
      {/* Padding at the bottom to prevent content from being obscured by the bottom nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
