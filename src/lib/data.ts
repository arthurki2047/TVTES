import type { Channel, ChannelCategory } from '@/lib/types';

export const channels: Channel[] = [
  {
    id: 'cbs-news',
    name: 'CBS News',
    category: 'News',
    logoUrl: 'https://picsum.photos/seed/102/100/100',
    logoImageHint: 'news logo',
    thumbnailUrl: 'https://picsum.photos/seed/101/600/400',
    thumbnailImageHint: 'news broadcast',
    streamUrl: 'https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8',
    type: 'hls',
  },
];

export const categories: { name: ChannelCategory; slug: string }[] = [
  { name: 'News', slug: 'news' },
];

export function getChannels(category?: string): Channel[] {
  if (category) {
    return channels.filter(channel => channel.category.toLowerCase() === category);
  }
  return channels;
}

export function getChannelById(id: string): Channel | undefined {
  return channels.find(channel => channel.id === id);
}

export function getChannelCategory(slug: string): { name: ChannelCategory; slug: string } | undefined {
    return categories.find(cat => cat.slug === slug);
}
