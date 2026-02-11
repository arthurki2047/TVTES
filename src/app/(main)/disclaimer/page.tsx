import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisclaimerPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Disclaimer</h1>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p><strong>Website Name:</strong> AMAR TV</p>
            <p><strong>Website URL:</strong> <a href="https://amartv.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://amartv.vercel.app/</a></p>
            <p className="mt-4 text-muted-foreground">
              The content on AMAR TV (the “Website”) is provided for informational and entertainment purposes only. AMAR TV does not stream or host any channels directly. All live TV channels and streams featured on our platform are publicly available on the internet and are aggregated from third-party sources. We do not own, control, or claim any rights to the content provided.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Ownership</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All live streams, TV channels, and media content displayed on AMAR TV are the property of their respective copyright holders. AMAR TV does not store, upload, or distribute any content. We simply link to third-party websites where the content is hosted and made available for free.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>No Control Over External Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV does not control or manage the availability of the content linked to from external websites. Therefore, we cannot guarantee the quality, accuracy, or continuous availability of any content. Users access these streams at their own risk, and we are not responsible for any interruptions, technical issues, or legal concerns arising from third-party links.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fair Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All content provided through AMAR TV is intended for personal, non-commercial use only. We encourage users to respect intellectual property rights and comply with applicable copyright laws in their region.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Changes to Content or Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV reserves the right to remove or modify any links or content at any time without prior notice. We are not responsible for any third-party content that may become unavailable or violate any legal regulations.
            </p>
          </CardContent>
        </Card>

        <p className="pt-4 text-center text-sm text-muted-foreground">
          By using this Website, you acknowledge and agree to this disclaimer and understand that AMAR TV is not responsible for the content linked to or provided by external sources.
        </p>
      </div>
    </div>
  );
}
