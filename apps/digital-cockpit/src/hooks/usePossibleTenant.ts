import { useMemo } from 'react';

export function usePossibleTenant(): string {
  const { pathname } = window.location;

  return useMemo(() => {
    const parts = pathname.split('/');
    if (parts.length > 1) {
      return parts[1];
    }
    return '';
  }, [pathname]);
}
