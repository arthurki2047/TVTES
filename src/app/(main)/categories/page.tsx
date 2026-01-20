import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Categories</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map(category => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group block">
            <Card className="overflow-hidden rounded-lg border-2 border-transparent transition-all duration-300 ease-in-out hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1.5">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={category.imageUrl}
                  alt={`An abstract image representing the ${category.name} category`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h2 className="font-headline text-2xl font-bold text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)]">{category.name}</h2>
                </div>
                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-primary">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
