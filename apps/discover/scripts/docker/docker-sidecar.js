const generateBaseUrls = (cluster, prod = false) => {
  switch (cluster) {
    case 'ew1': {
      return {
        appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
        cdfApiBaseUrl: 'https://api.cognitedata.com',
        cdfCluster: '',
        discoverApiBaseUrl: `https://discover-api.${
          prod ? '' : 'staging.'
        }cognite.ai`,
      };
    }
    default: {
      return {
        appsApiBaseUrl: prod
          ? `https://apps-api.${cluster}.cognite.ai`
          : `https://apps-api.staging.${cluster}.cognite.ai`,
        cdfApiBaseUrl: `https://${cluster}.cognitedata.com`,
        cdfCluster: cluster,
        discoverApiBaseUrl: `https://discover-api.${
          prod ? '' : 'staging.'
        }${cluster}.cognite.ai`,
      };
    }
  }
};

(function () {
  window.__cogniteSidecar = {
    __sidecarFormatVersion: 1,
    applicationId: 'pp-dev',
    applicationName: 'Discover',
    aadApplicationId: '',
    docsSiteBaseUrl: 'https://docs.cognite.com',
    intercom: '',
    mixpanel: '',
    nomaApiBaseUrl: 'https://noma.cognite.ai',
    privacyPolicyUrl: 'https://www.cognite.com/en/policy',
    seismicApiBaseUrl: 'https://seismic-api.development.cognite.ai',
    unleash: '',
    ...generateBaseUrls('CDF_CLUSTER' || 'ew1'),
  };
})();
