'use client';

import { Star } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FavoriteToggleButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  channelId: string;
  channelName: string;
}

export function FavoriteToggleButton({ channelId, channelName, className, ...props }: FavoriteToggleButtonProps) {
  const { isLoaded, isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(channelId);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(channelId);
  };

  if (!isLoaded) {
    return <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)} disabled {...props}><Star className="h-5 w-5" /></Button>;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn('h-8 w-8 text-muted-foreground hover:text-primary', isFav && 'text-yellow-400 hover:text-yellow-500', className)}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      {...props}
    >
      <Star className={cn('h-5 w-5', isFav && 'fill-current')} />
    </Button>
  );
}
