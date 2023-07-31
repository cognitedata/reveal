import { useState } from 'react';
import axios from 'axios';

export const getNewDomain = (hostname: string, cluster: string) => {
  const sections = hostname.split('.');

  if (hostname === 'localhost') {
    return `${hostname}:3000`;
  }

  if (sections.length === 2) {
    // eg: cogniteapp.com
    const [domain, tld] = sections;

    return [cluster, domain, tld].join('.');
  }

  if (sections.length === 3) {
    // eg: foo.cogniteapp.com
    const [app, domain, tld] = sections;
    if (app === cluster) {
      // if app === cluster, URL is already correct - dont adjust
      return [cluster, domain, tld].join('.');
    }
    return [app, cluster, domain, tld].join('.');
  }
  if (sections.length === 4) {
    if (
      sections[1] === 'preview' ||
      sections[1] === 'staging' ||
      sections[1] === 'pr'
    ) {
      // eg: foo.preview.cogniteapp.com
      const [app, type, domain, tld] = sections;
      return [app, type, cluster, domain, tld].join('.');
    }
    // eg: foo.cluster.cogniteapp.com
    const [app, _cluster, domain, tld] = sections;
    return [app, cluster, domain, tld].join('.');
  }
  if (sections.length === 5) {
    if (
      sections[1] === 'preview' ||
      sections[1] === 'staging' ||
      sections[1] === 'pr'
    ) {
      // eg: foo.preview.cluster.cogniteapp.com
      const [app, type, _cluster, domain, tld] = sections;
      return [app, type, cluster, domain, tld].join('.');
    }
  }
  throw new Error('Domain is not supported');
};

const useClusterSelector = (appName: string) => {
  const [redirectingToCluster, setRedirectingToCluster] = useState(false);
  const [validatingCluster, setValidatingCluster] = useState(false);

  const { hostname } = window.location;

  const isStaging = hostname.includes('.staging.');

  const onClusterSelected = (newTenant: string, cluster: string) => {
    localStorage.setItem('initialTenant', newTenant);

    setRedirectingToCluster(true);
    const { hash, search } = window.location;
    const url = [
      `https://${getNewDomain(hostname, cluster)}/${newTenant}`,
      search,
      hash,
    ]
      .filter(Boolean)
      .join('');
    window.location.href = url;
  };

  const checkClusterValidity = (tenant: string, cluster: string) => {
    setValidatingCluster(true);

    return axios
      .get(
        `https://apps-api.${
          isStaging ? 'staging.' : ''
        }${cluster}.cognite.ai/tenant`,
        {
          params: {
            tenant,
            app: appName,
            redirectUrl: `https://${getNewDomain(hostname, cluster)}`,
          },
        }
      )
      .then(() => true)
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        setValidatingCluster(false);
      });
  };

  return {
    checkClusterValidity,
    onClusterSelected,
    redirectingToCluster,
    validatingCluster,
  };
};

export default useClusterSelector;
