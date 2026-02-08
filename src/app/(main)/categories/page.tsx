'use client';

import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Categories</h1>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {categories.map(category => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group block">
            <Card className="overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
              <div className="relative aspect-square w-full">
                <Image
                  src={category.imageUrl}
                  alt={`An abstract image representing the ${category.name} category`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16vw, 12.5vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.imageHint}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <ChevronRight className="h-6 w-6" />
                    </div>
                </div>
              </div>
               <div className="p-2 bg-card">
                  <h2 className="text-center font-headline text-base font-bold">{category.name}</h2>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={() => router.back()} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
