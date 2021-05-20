/* eslint-disable no-underscore-dangle */
import merge from 'lodash/merge';

type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  docsSiteBaseUrl: string;
  nomaApiBaseUrl: string;
  privacyPolicyUrl: string;
  cdfCluster: string;
};

const sidecar = merge(
  {},
  {
    __sidecarFormatVersion: 1,
    applicationId: 'charts-dev',
    applicationName: 'Charts (staging)',
    docsSiteBaseUrl: 'https://docs.cognite.com',
    nomaApiBaseUrl: 'https://noma.development.cognite.ai',
    privacyPolicyUrl: 'https://www.cognite.com/en/policy',
    cdfCluster: '',
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  (window as any).__cogniteSidecar
) as Sidecar;

export default sidecar;
