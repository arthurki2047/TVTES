import { getChannels, getChannelCategory } from '@/lib/data';
import { ChannelCard } from '@/components/channel-card';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getChannelCategory(params.slug);
  if (!category) {
    notFound();
  }

  const channelsInCategory = getChannels(params.slug);

  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">{category.name}</h1>
      {channelsInCategory.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {channelsInCategory.map(channel => (
            <ChannelCard key={channel.id} channel={channel} listType="category" listValue={params.slug}/>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No channels found in this category.</p>
      )}
    </div>
  );
}
