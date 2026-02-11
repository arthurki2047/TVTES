
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Terms of Use</h1>
      <Card>
        <CardHeader>
          <CardTitle>Terms of Use</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please add your Terms of Use content here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
