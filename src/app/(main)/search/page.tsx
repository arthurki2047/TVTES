'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ChannelCard } from '@/components/channel-card';
import { channels } from '@/lib/data';
import { SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredChannels.map(channel => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
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
