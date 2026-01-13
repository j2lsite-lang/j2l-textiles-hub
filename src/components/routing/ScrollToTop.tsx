import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Forces scroll position to the top on client-side route changes.
 * Useful when navigating from footer links while already scrolled down.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
