import * as React from "react";

const MOBILE_BREAKPOINT = 768;

interface MobileResult {
  isMobile: boolean;
}

export function useMobile(): MobileResult {
  const [isMobileState, setIsMobileState] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobileState(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    mql.addEventListener("change", onChange);
    setIsMobileState(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return { isMobile: isMobileState };
}
