import { usePossibleTenant } from 'hooks';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom-v5';

export function useLink() {
  const history = useHistory();
  const tenant = usePossibleTenant();
  const documentTitle = useMemo(() => {
    if (window.location.hostname.includes('digital-cockpit')) {
      return 'Digital Cockpit';
    }
    return 'Solutions Portal';
  }, []);
  const fusionLink = useMemo(
    () => `https://fusion.cognite.com/${tenant}`,
    [tenant]
  );
  const accessManageLink = useMemo(
    () => `${fusionLink}/new-access-management/groups`,
    [fusionLink]
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
