import Link from 'next/link';
import Image from 'next/image';
import type { Channel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoriteToggleButton } from './favorite-toggle-button';

interface ChannelCardProps {
  channel: Channel;
  listType?: string;
  listValue?: string;
  className?: string;
}

export function ChannelCard({ channel, listType, listValue, className }: ChannelCardProps) {
  const watchHref = `/watch/${channel.id}${listType && listValue ? `?${listType}=${listValue}` : ''}`;
  
  return (
    <Link href={watchHref} className="group block">
      <Card className={cn("overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1", className)}>
        <CardContent className="p-0">
          <div className="relative">
            <Image
              src={channel.thumbnailUrl}
              alt={`Thumbnail for ${channel.name}`}
              width={200}
              height={200}
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={channel.thumbnailImageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge variant="destructive" className="absolute left-1.5 top-1.5 px-1.5 py-0.5 text-xs uppercase">Live</Badge>
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5">
              <Image
                src={channel.logoUrl}
                alt={`Logo for ${channel.name}`}
                width={400}
                height={400}
                className="h-8 w-8 rounded-full border-2 border-background/80 bg-background/80 object-contain p-0.5"
                data-ai-hint={channel.logoImageHint}
              />
              <h3 className="font-headline text-base font-semibold text-white shadow-black [text-shadow:0_1px_2px_var(--tw-shadow-color)]">
                {channel.name}
              </h3>
            </div>
             <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                <FavoriteToggleButton channelId={channel.id} channelName={channel.name} className="text-white hover:text-yellow-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
