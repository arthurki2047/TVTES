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
  {
    id: 'nasa-tv',
    name: 'NASA TV',
    category: 'Entertainment',
    logoUrl: 'https://picsum.photos/seed/402/100/100',
    logoImageHint: 'entertainment logo',
    thumbnailUrl: 'https://picsum.photos/seed/401/600/400',
    thumbnailImageHint: 'space shuttle',
    streamUrl: 'https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-Public/master.m3u8',
    type: 'hls',
  },
  {
    id: 'pga-tour',
    name: 'PGA Tour',
    category: 'Sports',
    logoUrl: 'https://picsum.photos/seed/202/100/100',
    logoImageHint: 'sports logo',
    thumbnailUrl: 'https://picsum.photos/seed/201/600/400',
    thumbnailImageHint: 'golf course',
    streamUrl: 'https://pgatour-i.akamaihd.net/hls/live/2022324/pgatour_global/master.m3u8',
    type: 'hls',
  },
  {
    id: 'big-buck-bunny',
    name: 'Big Buck Bunny',
    category: 'Movies',
    logoUrl: 'https://picsum.photos/seed/302/100/100',
    logoImageHint: 'movie logo',
    thumbnailUrl: 'https://picsum.photos/seed/301/600/400',
    thumbnailImageHint: 'cartoon rabbit',
    streamUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4',
  },
  {
    id: 'looney-tunes',
    name: 'Looney Tunes',
    category: 'Kids',
    logoUrl: 'https://picsum.photos/seed/502/100/100',
    logoImageHint: 'kids logo',
    thumbnailUrl: 'https://picsum.photos/seed/501/600/400',
    thumbnailImageHint: 'cartoon animation',
    streamUrl: 'https://archive.org/download/looney-tunes-1930-1969-collection/Porky%27s%20Preview%20%281941%29.mp4',
    type: 'mp4',
  },
  {
    id: 'mtv-music',
    name: 'MTV Pluto TV',
    category: 'Music',
    logoUrl: 'https://picsum.photos/seed/602/100/100',
    logoImageHint: 'music logo',
    thumbnailUrl: 'https://picsum.photos/seed/601/600/400',
    thumbnailImageHint: 'concert crowd',
    streamUrl: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5e679c10f842de0007658517/master.m3u8?deviceId=null&deviceModel=web&deviceVersion=7.12.0&appVersion=7.12.0-d830b533a6f4e135e19e782d449982404b93b8f1&deviceType=web&deviceMake=chrome&silo=stitcher',
    type: 'hls',
  },
    {
    id: 'nbc-news',
    name: 'NBC News',
    category: 'News',
    logoUrl: 'https://picsum.photos/seed/104/100/100',
    logoImageHint: 'news logo',
    thumbnailUrl: 'https://picsum.photos/seed/103/600/400',
    thumbnailImageHint: 'news desk',
    streamUrl: 'https://nbcnews2-i.akamaihd.net/hls/live/723405/NBCNews2/master_1200.m3u8',
    type: 'hls',
  },
  {
    id: 'bein-sports',
    name: 'beIN Sports',
    category: 'Sports',
    logoUrl: 'https://picsum.photos/seed/204/100/100',
    logoImageHint: 'sports logo',
    thumbnailUrl: 'https://picsum.photos/seed/203/600/400',
    thumbnailImageHint: 'soccer stadium',
    streamUrl: 'https://edge-vos-jf-1-prod.secdn.net/beinsports/3c9e6f1f-4632-45f1-a128-21695221927e/chunklist.m3u8',
    type: 'hls',
  }
];

export const categories: { name: ChannelCategory; slug: string }[] = [
  { name: 'News', slug: 'news' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Movies', slug: 'movies' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Music', slug: 'music' },
  { name: 'Other', slug: 'other' },
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
