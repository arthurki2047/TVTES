
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Terms of Use</h1>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p><strong>Website Name:</strong> AMAR TV</p>
            <p><strong>Website URL:</strong> <a href="https://amartv.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://amartv.vercel.app/</a></p>
            <p><strong>Last Updated:</strong> 30/01/2025</p>
            <p className="mt-4 text-muted-foreground">
              By accessing and using AMAR TV (the “Website”), you agree to comply with and be bound by these Terms of Use. Please read this agreement carefully before using the Website. If you do not agree to these Terms of Use, you must not use the Website.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Use of the Website</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV provides a platform that aggregates live TV streams that are publicly available on the internet. We do not host or stream any content directly on the Website. All streams are provided by third-party sources, and we do not claim ownership or responsibility for the content. You agree to use the Website for lawful purposes and in accordance with the law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Content Ownership</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The live TV channels and streams featured on AMAR TV are the property of their respective copyright holders. AMAR TV does not store, upload, or distribute any media content. All content linked to on the Website is publicly accessible via third-party websites. AMAR TV does not have control over the availability or quality of such content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. No Liability for Legal Consequences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV is not responsible for any legal consequences or claims arising from the content displayed on the Website. We aggregate publicly available content from third-party sources and are not responsible for any violations of copyright or intellectual property rights by those third-party providers.
              If you believe that any content on our Website violates your rights or infringes on your copyright, please inform us immediately via our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>. We will take action and remove the content as soon as possible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Prohibited Conduct</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground mt-2">
              <li>Use the Website for any illegal, unlawful, or unauthorized purposes.</li>
              <li>Infringe the intellectual property rights of others.</li>
              <li>Attempt to access content that is not publicly available or modify the Website’s features.</li>
              <li>Engage in activities that could harm, disrupt, or interfere with the Website’s functionality or servers.</li>
              <li>Post, upload, or distribute harmful content, including malware, viruses, or other harmful code.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. No Guarantee of Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              While AMAR TV strives to provide a seamless experience, we do not guarantee the availability, quality, or uninterrupted streaming of any content. Third-party sources may alter or remove their streams at any time, and AMAR TV cannot be held responsible for such changes or disruptions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Third-Party Links and Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV may provide links to third-party websites that host live TV streams and other content. These third-party websites are not under the control of AMAR TV, and we are not responsible for their content, privacy practices, or terms of use. By using the Website, you acknowledge that AMAR TV is not responsible for any third-party content or services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Privacy and Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By using the Website, you agree to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>. We may collect information about your interactions with the Website to improve your experience and provide personalized content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV is not liable for any damages, losses, or issues arising from the use of the Website, including but not limited to interruptions in service, inaccuracies in content, or technical issues. You agree to use the Website at your own risk.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Terms of Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV reserves the right to modify, update, or change these Terms of Use at any time. Any changes will be posted on this page, and the “Last Updated” date will be revised. It is your responsibility to review these Terms regularly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Termination of Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AMAR TV reserves the right to terminate or suspend your access to the Website at our discretion, without notice, for any violation of these Terms of Use.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions or concerns regarding these Terms of Use, or if you believe any content on the Website violates your rights, please contact us through our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
