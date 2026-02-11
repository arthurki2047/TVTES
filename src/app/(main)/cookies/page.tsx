
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Cookie Policy</h1>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p><strong>Effective Date:</strong> 11/02/2026</p>
            <p className="mt-4 text-muted-foreground">
              This Cookie Policy explains how AMAR TV (“we,” “us,” or “our”) uses cookies and similar technologies on <a href="https://amartv.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://amartv.vercel.app/</a>. By using our website, you agree to the use of cookies as described in this policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cookies are small text files placed on your device (computer, tablet, or smartphone) when you visit a website. They help websites function properly, improve user experience, and provide analytical insights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">a. Essential Cookies</h3>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Required for the basic operation of our website.</li>
                <li>Enable core features like page navigation and secure access.</li>
                <li>Without these, the site may not work properly.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">b. Performance &amp; Analytics Cookies</h3>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Help us understand how visitors interact with our site.</li>
                <li>Collect information such as pages visited, time spent, and errors encountered.</li>
                <li>We may use trusted third parties like Google Analytics for this purpose.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">c. Functionality Cookies</h3>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Allow the site to remember your preferences (e.g., language, theme).</li>
                <li>Provide a more personalized browsing experience.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">d. Third-Party Cookies</h3>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Some embedded content (like live streams, social media, or ads) may set their own cookies.</li>
                <li>We do not control third-party cookies, and you should check their policies for details.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Why We Use Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We use cookies to:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Ensure smooth site functionality</li>
              <li>Improve speed, security, and performance</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Enhance user experience with personalized features</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Managing Your Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You can control or delete cookies at any time:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Most browsers allow you to block or delete cookies through their settings.</li>
              <li>If you disable cookies, some features of Amar TV may not function properly.</li>
            </ul>
            <p className="mt-4 text-muted-foreground">For detailed guidance, visit:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome Cookie Settings</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox Cookie Settings</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge Cookie Settings</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari Cookie Settings</a></li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>5. Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time. Any changes will be posted here, and the “Effective Date” will be updated accordingly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions about our use of cookies, please <Link href="/contact" className="text-primary hover:underline">contact us via our Contact Page</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
