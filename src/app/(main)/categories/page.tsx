import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Categories</h1>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map(category => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group block">
            <Card className="overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={category.imageUrl}
                  alt={`An abstract image representing the ${category.name} category`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.imageHint}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <ChevronRight className="h-8 w-8" />
                    </div>
                </div>
              </div>
               <div className="p-3 bg-card">
                  <h2 className="text-center font-headline text-lg font-bold">{category.name}</h2>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
