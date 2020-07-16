/* eslint-disable no-underscore-dangle */
import merge from 'lodash/merge';

type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  docsSiteBaseUrl: string;
  nomaApiBaseUrl: string;
};

const sidecar = merge(
  {},
  {
    __sidecarFormatVersion: 1,
    applicationId: 'fas-demo',
    applicationName: 'React Demo (staging)',
    appsApiBaseUrl: 'https://development.apps-api.cognite.ai',
    cdfApiBaseUrl: 'https://api.cognitedata.com',
    docsSiteBaseUrl: 'https://docs.cognite.com',
    nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  (window as any).__cogniteSidecar
) as Sidecar;

export default sidecar;
