import { useState } from 'react';

import axios from 'axios';

export const getNewDomain = (hostname: string, cluster: string) => {
  const sections = hostname.split('.');
  if (sections.length === 3) {
    // eg: foo.cogniteapp.com
    const [subdomain, domain, tld] = sections;
    return [subdomain, cluster, domain, tld].join('.');
  }
  if (sections.length === 4) {
    if (sections[0] === 'preview' || sections[0] === 'staging') {
      // eg: preview.foo.cogniteapp.com
      const [type, subdomain, domain, tld] = sections;
      return [type, subdomain, cluster, domain, tld].join('.');
    }
    // eg: foo.cluster.cogniteapp.com
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [app, _cluster, domain, tld] = sections;
    return [app, cluster, domain, tld].join('.');
  }
  if (sections.length === 5) {
    if (sections[0] === 'preview') {
      // eg: preview.foo.cluster.cogniteapp.com
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [type, app, _cluster, domain, tld] = sections;
      return [type, app, cluster, domain, tld].join('.');
    }
    // eg: 1234.pr.foo.cogniteapp.com
    const [num, pr, app, domain, tld] = sections;
    return [num, pr, app, cluster, domain, tld].join('.');
  }
  if (sections.length === 6) {
    // eg: 1234.pr.foo.cluster.cogniteapp.com
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [num, pr, app, _cluster, domain, tld] = sections;
    return [num, pr, app, cluster, domain, tld].join('.');
  }
  throw new Error('Domain is not supported');
};

const useClusterSelector = (appName: string) => {
  const [redirectingToCluster, setRedirectingToCluster] = useState(false);
  const [validatingCluster, setValidatingCluster] = useState(false);

  const { hostname } = window.location;

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
    const redirectUrl = `https://${getNewDomain(hostname, cluster)}`;
    const optionalStaging =
      redirectUrl.indexOf('staging') > -1 ? '.staging' : '';
    return axios
      .get(`https://apps-api${optionalStaging}.${cluster}.cognite.ai/tenant`, {
        params: {
          tenant,
          app: appName,
          redirectUrl,
        },
      })
      .then(() => {
        return true;
      })
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
