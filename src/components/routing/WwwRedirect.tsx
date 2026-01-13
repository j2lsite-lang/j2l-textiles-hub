import { useEffect } from 'react';

/**
 * Client-side redirect from www.j2ltextiles.fr to j2ltextiles.fr
 * For a true 301 redirect, configure this in Cloudflare Page Rules or Redirect Rules
 */
export function WwwRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      // Redirect www to non-www
      if (host.startsWith('www.')) {
        const newHost = host.replace(/^www\./, '');
        const newUrl = `${window.location.protocol}//${newHost}${window.location.pathname}${window.location.search}${window.location.hash}`;
        // Use replace to mimic 301 behavior (no back button entry)
        window.location.replace(newUrl);
      }
    }
  }, []);

  return null;
}
