'use client';

import { useState, useMemo } from 'react';
import { getChannels, getChannelCategory } from '@/lib/data';
import { ChannelCard } from '@/components/channel-card';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { ChannelListItem } from '@/components/channel-list-item';

export default function CategoryPage() {
  const [view, setView] = useState('grid');
  const params = useParams<{ slug: string }>();
  
  const category = useMemo(() => getChannelCategory(params.slug), [params.slug]);

  if (!category) {
    notFound();
  }

  const channelsInCategory = useMemo(() => getChannels(params.slug), [params.slug]);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-4xl font-bold">{category.name}</h1>
        {channelsInCategory.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-muted p-1">
                <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('grid')} className="rounded-full gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Grid
                </Button>
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')} className="rounded-full gap-2">
                    <List className="h-4 w-4" />
                    List
                </Button>
            </div>
        )}
      </div>

      {channelsInCategory.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {channelsInCategory.map(channel => (
              <ChannelCard key={channel.id} channel={channel} listType="category" listValue={params.slug}/>
            ))}
          </div>
        ) : (
            <div className="space-y-2">
                {channelsInCategory.map(channel => (
                    <ChannelListItem key={channel.id} channel={channel} listType="category" listValue={params.slug}/>
                ))}
            </div>
        )
      ) : (
        <p className="text-muted-foreground">No channels found in this category.</p>
      )}
    </div>
  );
}
