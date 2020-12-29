/* eslint-disable no-underscore-dangle */
import merge from 'lodash/merge';

type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  digitalCockpitApiBaseUrl: string;
  docsSiteBaseUrl: string;
  nomaApiBaseUrl: string;
  intercom: string;
};

const sidecar = merge(
  {},
  {
    __sidecarFormatVersion: 1,
    applicationId: 'fas-demo',
    applicationName: 'Digital Cockpit (dev)',
    appsApiBaseUrl: 'https://development.apps-api.cognite.ai',
    cdfApiBaseUrl: 'https://api.cognitedata.com',
    digitalCockpitApiBaseUrl: 'https://digital-cockpit-api.staging.cognite.ai',
    docsSiteBaseUrl: 'https://docs.cognite.com',
    nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  (window as any).__cogniteSidecar
) as Sidecar;

export default sidecar;
