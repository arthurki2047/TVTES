
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DMCAPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">DMCA/Copyright Policy</h1>
      <Card>
        <CardHeader>
          <CardTitle>DMCA/Copyright Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please add your DMCA/Copyright Policy content here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
