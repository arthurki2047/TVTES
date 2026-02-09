'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChannelCard } from '@/components/channel-card';
import { RecentlyPlayed } from '@/components/recommendations';
import { getChannels, channels } from '@/lib/data';
import { SiteLogo } from '@/components/site-logo';
import Link from 'next/link';
import { Search, LayoutGrid, List, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChannelListItem } from '@/components/channel-list-item';
import type { Language } from '@/lib/types';

const INITIAL_CHANNEL_COUNT = 20;

export default function HomePage() {
  const [view, setView] = useState('grid');
  const [visibleChannelsCount, setVisibleChannelsCount] = useState(INITIAL_CHANNEL_COUNT);
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'All'>('All');

  const languages = useMemo(() => {
    const allLangs = channels.map(c => c.language);
    return ['All', ...[...new Set(allLangs)].sort()] as (Language | 'All')[];
  }, []);

  const allChannels = useMemo(() => getChannels(), []);

  const filteredChannels = useMemo(() => {
    if (selectedLanguage === 'All') {
      return allChannels;
    }
    return allChannels.filter(c => c.language === selectedLanguage);
  }, [selectedLanguage, allChannels]);

  useEffect(() => {
    setVisibleChannelsCount(INITIAL_CHANNEL_COUNT);
  }, [selectedLanguage]);

  const totalChannels = filteredChannels.length;

  const showMoreChannels = () => {
    setVisibleChannelsCount(totalChannels);
  };

  const channelsToShow = filteredChannels.slice(0, visibleChannelsCount);

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
        
        <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Filter by Language</h2>
            <div className="flex flex-wrap items-center gap-2">
              {languages.map(lang => (
                <Button
                  key={lang}
                  variant={selectedLanguage === lang ? 'secondary' : 'ghost'}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </Button>
              ))}
            </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-3xl font-bold">All Channels</h2>
            <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('grid')} className="rounded-full gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Grid
                </Button>
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')} className="rounded-full gap-2">
                    <List className="h-4 w-4" />
                    List
                </Button>
            </div>
            <div className="hidden sm:block text-muted-foreground font-bold">{totalChannels} Channels</div>
          </div>
          
          {channelsToShow.length > 0 ? (
            view === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {channelsToShow.map(channel => (
                    <ChannelCard key={channel.id} channel={channel} listType="list" listValue="all" />
                ))}
                </div>
            ) : (
                <div className="space-y-2">
                {channelsToShow.map(channel => (
                    <ChannelListItem key={channel.id} channel={channel} listType="list" listValue="all" />
                ))}
                </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
                <h3 className="mt-4 text-xl font-semibold">No Channels Found</h3>
                <p className="mt-2 text-muted-foreground">No channels match the selected language &quot;{selectedLanguage}&quot;.</p>
            </div>
          )}

          {visibleChannelsCount < totalChannels && (
            <div className="text-center mt-6">
              <Button onClick={showMoreChannels} variant="outline" size="lg">
                <ChevronDown className="mr-2 h-4 w-4" />
                Show All Channels
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
