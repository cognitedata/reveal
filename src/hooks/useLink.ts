import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

export function useLink() {
  const history = useHistory();
  const documentTitle = useMemo(() => {
    switch (window.location.hostname) {
      case 'cogniteapp.com':
        return 'Solutions Portal';
      default:
        return 'Digital Cockpit';
    }
  }, [window.location.hostname]);

  return {
    createLink: (pathname: string) => {
      const { location } = window;
      const baseUrl = `${location.protocol}//${location.host}`;
      const path = history.createHref({ pathname });
      return `${baseUrl}${path}`;
    },
    documentTitle,
  };
}
