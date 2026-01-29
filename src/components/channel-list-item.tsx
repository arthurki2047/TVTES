import Link from 'next/link';
import Image from 'next/image';
import type { Channel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { FavoriteToggleButton } from './favorite-toggle-button';

interface ChannelListItemProps {
  channel: Channel;
  listType?: string;
  listValue?: string;
  className?: string;
}

export function ChannelListItem({ channel, listType, listValue, className }: ChannelListItemProps) {
  const watchHref = `/watch/${channel.id}${listType && listValue ? `?${listType}=${listValue}` : ''}`;
  
  return (
    <Link href={watchHref} className="group block">
      <Card className={cn("overflow-hidden transition-all duration-300 ease-in-out hover:bg-muted/50 hover:shadow-md", className)}>
        <div className="flex items-center p-2 gap-4">
            <Image
              src={channel.logoUrl}
              alt={`Logo for ${channel.name}`}
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg border bg-card object-contain p-1"
              data-ai-hint={channel.logoImageHint}
            />
            <div className="flex-1 min-w-0">
                <h3 className="font-headline text-lg font-semibold truncate">
                  {channel.name}
                </h3>
                <p className="text-sm text-muted-foreground">{channel.category}</p>
            </div>
            <FavoriteToggleButton channelId={channel.id} channelName={channel.name} />
        </div>
      </Card>
    </Link>
  );
}
