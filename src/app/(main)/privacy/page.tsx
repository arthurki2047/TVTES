
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Privacy Policy</h1>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p><strong>Effective Date:</strong> 30/01/2026</p>
            <p className="mt-4 text-muted-foreground">
              At AMAR TV (“we,” “us,” or “our”), accessible at <a href="https://amartv.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://amartv.vercel.app/</a>, your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, and the choices you have in relation to your data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">a. Automatically Collected Information</h3>
              <p className="text-muted-foreground">When you visit AMAR TV, we may automatically collect:</p>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Referring site</li>
                <li>Pages viewed and time spent</li>
                <li>General location data (e.g., country or city, not exact address)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">b. Contact Form</h3>
              <p className="text-muted-foreground">If you contact us via our Contact Page, we may collect:</p>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
                <li>Your name (optional)</li>
                <li>Your email address</li>
                <li>Any information you provide in the message</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We use collected data for:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
              <li>Improving website performance and user experience</li>
              <li>Monitoring traffic patterns and site usage</li>
              <li>Responding to inquiries submitted through the contact form</li>
            </ul>
            <p className="mt-4 text-muted-foreground">We do not sell, share, or trade your data with third parties for marketing purposes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
                <li>Maintain site functionality</li>
                <li>Understand how visitors use the site</li>
                <li>Provide basic analytics via trusted third parties (like Google Analytics)</li>
            </ul>
            <p className="mt-4 text-muted-foreground">You can disable cookies in your browser settings, but some features of the site may not function properly if cookies are turned off.</p>
            <p className="mt-4 text-muted-foreground">Please refer to our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link> for more details.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Third-Party Links</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV may link to or embed third-party content (e.g., live streams). These external sites are not governed by this Privacy Policy. We recommend reviewing the privacy policies of any third-party websites you visit.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We take reasonable steps to secure your information using standard practices. However, no method of online transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Children’s Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV is not intended for children under the age of 13. We do not knowingly collect personal data from minors. If you believe a child has provided us with personal information, please contact us via our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link> so we can delete it promptly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Depending on your region, you may have the right to:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
                <li>Request access to your data</li>
                <li>Request correction or deletion of your data</li>
                <li>Withdraw consent to data collection</li>
            </ul>
            <p className="mt-4 text-muted-foreground">To exercise your rights, contact us through our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>8. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. All changes will be posted here, and the “Effective Date” will reflect the latest update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions or concerns about this Privacy Policy, please reach out through our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
