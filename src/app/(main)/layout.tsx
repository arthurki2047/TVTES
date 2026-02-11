import { BottomNav } from '@/components/bottom-nav';
import { Footer } from '@/components/footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <BottomNav />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Padding at the bottom to prevent content from being obscured by the bottom nav */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
