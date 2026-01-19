import Link from 'next/link';
import { categories } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Categories</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {categories.map(category => (
          <Link key={category.slug} href={`/categories/${category.slug}`}>
            <Card className="flex items-center justify-between p-4 transition-all hover:bg-primary/10 hover:shadow-lg">
              <span className="font-headline text-xl font-semibold">{category.name}</span>
              <ChevronRight className="h-6 w-6 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
