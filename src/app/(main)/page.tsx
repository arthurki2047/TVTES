import { ChannelCard } from '@/components/channel-card';
import { RecentlyPlayed } from '@/components/recommendations';
import { getChannels } from '@/lib/data';
import { SiteLogo } from '@/components/site-logo';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function HomePage() {
  const channels = getChannels();
  const totalChannels = channels.length;

  return (
    <div className="container py-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between md:hidden">
          <SiteLogo />
          <Link href="/search">
            <div className="flex flex-col items-center text-muted-foreground">
              <span className="text-sm font-bold">Quick Search</span>
              <Search className="h-7 w-7" />
            </div>
          </Link>
        </div>

        <RecentlyPlayed />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-3xl font-bold">All Channels</h2>
            <div className="text-muted-foreground font-bold">{totalChannels} Channels</div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {channels.map(channel => (
              <ChannelCard key={channel.id} channel={channel} listType="list" listValue="all" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
