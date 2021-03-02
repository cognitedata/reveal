import { useState } from 'react';

import axios from 'axios';

export const getNewDomain = (hostname: string, cluster: string) => {
  const sections = hostname.split('.');
  if (sections.length === 3) {
    // eg: foo.cogniteapp.com
    const [app, domain, tld] = sections;
    return [app, cluster, domain, tld].join('.');
  }
  if (sections.length === 4) {
    if (sections[0] === 'preview' || sections[0] === 'staging') {
      // eg: preview.foo.cogniteapp.com
      const [type, app, domain, tld] = sections;
      return [type, app, cluster, domain, tld].join('.');
    }
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
    if (sections[0] === 'preview' || sections[0] === 'staging') {
      // eg: foo.preview.cluster.cogniteapp.com
      const [type, app, _cluster, domain, tld] = sections;
      return [type, app, cluster, domain, tld].join('.');
    }
    if (
      sections[1] === 'preview' ||
      sections[1] === 'staging' ||
      sections[1] === 'pr'
    ) {
      // Handle 1234.pr.foo.cogniteapp.com edge case
      if (Number.isNaN(+sections[0])) {
        // eg: foo.preview.cluster.cogniteapp.com
        const [app, type, _cluster, domain, tld] = sections;
        return [app, type, cluster, domain, tld].join('.');
      }
    }
    // eg: 1234.pr.foo.cogniteapp.com
    const [num, pr, app, domain, tld] = sections;
    return [num, pr, app, cluster, domain, tld].join('.');
  }
  if (sections.length === 6) {
    // eg: 1234.pr.foo.cluster.cogniteapp.com
    const [num, pr, app, _cluster, domain, tld] = sections;
    return [num, pr, app, cluster, domain, tld].join('.');
  }
  throw new Error('Domain is not supported');
};

const useClusterSelector = (appName: string) => {
  const [redirectingToCluster, setRedirectingToCluster] = useState(false);
  const [validatingCluster, setValidatingCluster] = useState(false);

  const { hostname } = window.location;

  const initialCluster = localStorage.getItem('initialCluster');

  const onClusterSelected = (newTenant: string, cluster: string) => {
    localStorage.setItem('initialTenant', newTenant);
    localStorage.setItem('initialCluster', cluster);
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
      .get(`https://${cluster}.apps-api.cognite.ai/tenant`, {
        params: {
          tenant,
          app: appName,
          redirectUrl: `https://${getNewDomain(hostname, cluster)}`,
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
    initialCluster,
  };
};

export default useClusterSelector;
