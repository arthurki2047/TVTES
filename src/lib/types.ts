export type ChannelCategory = 'News' | 'Entertainment' | 'Kids' | 'Music' | 'Infotainment' | 'Sports' | 'Movies' | 'English Movies' | 'Devotional' | 'Educational' | 'Lifestyle' | 'Other';
export type Language = 'Bengali' | 'Hindi' | 'English' | 'Bhojpuri';

export interface Channel {
  id: string;
  name: string;
  category: ChannelCategory;
  language: Language;
  logoUrl: string;
  logoImageHint: string;
  thumbnailUrl: string;
  thumbnailImageHint: string;
  streamUrl: string;
  type: 'hls' | 'mp4' | 'iframe';
}
