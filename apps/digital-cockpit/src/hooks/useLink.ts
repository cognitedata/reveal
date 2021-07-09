import { usePossibleTenant } from 'hooks';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

export function useLink() {
  const history = useHistory();
  const tenant = usePossibleTenant();
  const documentTitle = useMemo(() => {
    switch (window.location.hostname) {
      case 'cogniteapp.com':
        return 'Solutions Portal';
      default:
        return 'Digital Cockpit';
    }
  }, [window.location.hostname]);
  const fusionLink = useMemo(
    () => `https://fusion.cognite.com/${tenant}`,
    [tenant]
  );
  const accessManageLink = useMemo(
    () => `${fusionLink}/new-access-management/groups`,
    [tenant]
  );

  return {
    createLink: (pathname: string) => {
      const { location } = window;
      const baseUrl = `${location.protocol}//${location.host}`;
      const path = history.createHref({ pathname });
      return `${baseUrl}${path}`;
    },
    documentTitle,
    fusionLink,
    accessManageLink,
  };
}
