
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DMCAPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">DMCA/Copyright Policy</h1>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p><strong>Effective Date:</strong> 30/01/2026</p>
            <p><strong>Website:</strong> <a href="https://amartv.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://amartv.vercel.app/</a></p>

            <p className="mt-4 text-muted-foreground">
              At AMAR TV, we fully respect the intellectual property rights of others and act in compliance with the Digital Millennium Copyright Act (DMCA). All content on this website is posted exclusively by the site administrator. No user accounts, uploads, or external submissions are allowed.
            </p>
            <p className="mt-2 text-muted-foreground">
              We do not host or stream any content directly. All media featured on AMAR TV is sourced from freely available content already published on the internet and is embedded or linked from third-party platforms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Reporting Copyright Infringement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you are a copyright owner or legally authorized to act on behalf of one, and you believe any content on <a href="https://amartv.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://amartv.vercel.app/</a> infringes upon your rights, you may submit a takedown request.
            </p>
            <p className="mt-4 text-muted-foreground">Your notice must include the following:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
              <li>Your full legal name and contact information</li>
              <li>A clear description of the copyrighted work that you claim has been infringed</li>
              <li>The exact URL(s) of the content you wish to report</li>
              <li>A good-faith statement that the use is unauthorized</li>
              <li>A statement under penalty of perjury that the information you provide is accurate and that you are authorized to act on behalf of the copyright owner</li>
              <li>Your physical or electronic signature</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Please submit your request only through our official <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Content Removal Process</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Upon receiving a valid DMCA notice, we will:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
              <li>Promptly review the claim</li>
              <li>Remove or disable access to the content if infringement is confirmed</li>
              <li>Notify the reporting party of the action taken</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Since only the admin can post content on this site, there is no need to notify any third party or uploader.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Good-Faith Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV operates as a content aggregator and does not host any copyrighted media. If any material unintentionally violates copyright, we are committed to resolving the issue as quickly as possible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To report copyright concerns, please contact us only via our official <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>. Legal notices sent by other means may not be received or processed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
