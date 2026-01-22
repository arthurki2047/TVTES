import { ChannelCard } from '@/components/channel-card';
import { RecentlyPlayed } from '@/components/recommendations';
import { getChannels } from '@/lib/data';
import { SiteLogo } from '@/components/site-logo';

export default function HomePage() {
  const channels = getChannels();

  return (
    <div className="container py-6">
      <div className="space-y-8">
        <div className="md:hidden">
            <SiteLogo />
        </div>

        <RecentlyPlayed />

        <section className="space-y-4">
          <h2 className="font-headline text-3xl font-bold">All Channels</h2>
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
