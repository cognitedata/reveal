/* eslint-disable no-underscore-dangle */
import merge from 'lodash/merge';

type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  cdfApiBaseUrl: string;
  digitalCockpitApiBaseUrl: string;
  docsSiteBaseUrl: string;
  intercom: string;
  intercomTourId: string;
  privacyPolicyUrl: string;
};

const sidecar = merge(
  {},
  {
    __sidecarFormatVersion: 1,
    applicationId: 'digital-cockpit-dev',
    applicationName: 'Digital Cockpit (dev)',
    cdfApiBaseUrl: 'https://api.cognitedata.com',
    digitalCockpitApiBaseUrl: 'https://digital-cockpit-api.staging.cognite.ai',
    docsSiteBaseUrl: 'https://docs.cognite.com',
    intercom: 'ou1uyk2p',
    intercomTourId: 199165,
    privacyPolicyUrl: 'https://www.cognite.com/en/policy',
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  (window as any).__cogniteSidecar
) as Sidecar;

export default sidecar;
