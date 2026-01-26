export type ChannelCategory = 'News' | 'Entertainment' | 'Kids' | 'Music' | 'Infotainment' | 'Sports' | 'Movies' | 'Devotional' | 'Educational' | 'Lifestyle' | 'Other';

export interface Channel {
  id: string;
  name: string;
  category: ChannelCategory;
  logoUrl: string;
  logoImageHint: string;
  thumbnailUrl: string;
  thumbnailImageHint: string;
  streamUrl: string;
  type: 'hls' | 'mp4' | 'iframe';
  autoReloadInMinutes?: number;
}
