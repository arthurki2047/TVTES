import Link from 'next/link';

const footerLinks = [
  { href: '/dmca', label: 'DMCA/Copyright Policy' },
  { href: '/terms', 'label': 'Terms of Use' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="bg-background/80 py-6 border-t mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center text-xs text-muted-foreground/50">
          <p>&copy; {new Date().getFullYear()} Amar TV. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
