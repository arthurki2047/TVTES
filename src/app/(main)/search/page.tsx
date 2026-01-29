'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ChannelCard } from '@/components/channel-card';
import { channels } from '@/lib/data';
import { SearchIcon, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChannelListItem } from '@/components/channel-list-item';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');

  const filteredChannels = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    return channels.filter(
      channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Search</h1>
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search channels by name or category..."
          className="w-full rounded-full bg-muted pl-10 py-6 text-lg"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        {searchTerm && filteredChannels.length > 0 && (
          <>
            <div className="flex justify-end mb-4">
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
            </div>
            {view === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredChannels.map(channel => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            ) : (
                <div className="space-y-2">
                    {filteredChannels.map(channel => (
                        <ChannelListItem key={channel.id} channel={channel} />
                    ))}
                </div>
            )}
          </>
        )}
        {searchTerm && filteredChannels.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg font-semibold">No results found for &quot;{searchTerm}&quot;</p>
            <p className="text-muted-foreground">Try a different search term.</p>
          </div>
        )}
        {!searchTerm && (
            <div className="text-center py-10">
                <p className="text-lg font-semibold">Find your favorite channels</p>
                <p className="text-muted-foreground">Start typing to see results.</p>
            </div>
        )}
      </div>
    </div>
  );
}
