import { useState } from 'react';

import axios from 'axios';

const useClusterSelector = (appName: string) => {
  const [redirectingToCluster, setRedirectingToCluster] = useState(false);
  const [validatingCluster, setValidatingCluster] = useState(false);

  const domain = window.location.hostname;

  const getNewDomain = (cluster: string) => {
    const sections = domain.split('.');
    if (sections.length === 3) {
      // eg: foo.cogniteapp.com
      const [subdomain, _domain, tld] = sections;
      return [subdomain, cluster, _domain, tld].join('.');
    }
    if (sections.length === 4) {
      if (sections[0] === 'preview' || sections[0] === 'staging') {
        // eg: preview.foo.cogniteapp.com
        const [type, subdomain, _domain, tld] = sections;
        return [type, subdomain, cluster, _domain, tld].join('.');
      }
      // eg: foo.cluster.cogniteapp.com
      return [sections[0], cluster, sections[2], sections[3]].join('.');
    }
    if (sections.length === 5) {
      // eg: preview.foo.cluster.cogniteapp.com
      return [sections[0], sections[1], cluster, sections[3], sections[4]].join(
        '.'
      );
    }
    throw new Error('Domain is not supported');
  };

  const onClusterSelected = (newTenant: string, cluster: string) => {
    localStorage.setItem('initialTenant', newTenant);
    setRedirectingToCluster(true);
    const { hash, search } = window.location;
    const url = [`https://${getNewDomain(cluster)}/${newTenant}`, search, hash]
      .filter(Boolean)
      .join('');
    window.location.href = url;
  };

  const checkClusterValidity = (tenant: string, cluster: string) => {
    setValidatingCluster(true);
    return axios
      .get(`https://${cluster}.apps-api.cognite.ai/tenant`, {
        params: { tenant, app: appName, cluster },
      })
      .then(() => {
        return axios
          .get(`https://${getNewDomain(cluster)}`)
          .then(() => {
            return true;
          })
          .catch((e) => {
            throw e;
          });
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
