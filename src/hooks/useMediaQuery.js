import { useState, useEffect } from 'react';

/**
 * Responsive breakpoints:
 *   mobile  : width < 600px   (phones)
 *   tablet  : 600px – 899px   (large phones, small tablets)
 *   desktop : width ≥ 900px   (tablets, laptops, monitors)
 *
 * @returns {{ isMobile: boolean, isTablet: boolean, isDesktop: boolean, windowWidth: number }}
 */
export function useMediaQuery() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile:  windowWidth < 600,
    isTablet:  windowWidth >= 600 && windowWidth < 900,
    isDesktop: windowWidth >= 900,
    windowWidth,
  };
}
