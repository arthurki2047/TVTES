'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';

const NOTICE_DISMISSED_KEY = 'amartv-notice-dismissed';

export function NoticeBoard() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // This effect runs only on the client, where localStorage is available.
    try {
      const dismissed = localStorage.getItem(NOTICE_DISMISSED_KEY);
      if (dismissed !== 'true') {
        setIsDismissed(false);
      }
    } catch (error) {
      // If localStorage is not available, show the notice.
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(NOTICE_DISMISSED_KEY, 'true');
    } catch (error) {
      console.error('Could not write to localStorage', error);
    }
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="relative bg-primary p-3 text-sm text-primary-foreground">
      <div className="container flex items-center justify-center gap-2">
        <Info className="h-5 w-5 flex-shrink-0" />
        <p className="flex-grow text-center">
          All content featured on AMAR TV is sourced from publicly available platforms on the internet. We do not host or stream any content directly. If you are a copyright holder and believe any content should be removed, please contact us and we will take immediate action.
        </p>
        <Button variant="ghost" size="icon" className="flex-shrink-0 hover:bg-primary-foreground/10 h-7 w-7" onClick={handleDismiss}>
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss notice</span>
        </Button>
      </div>
    </div>
  );
}
