/* eslint-disable no-underscore-dangle */
import { SidecarConfig, getDefaultSidecar } from '@cognite/sidecar';

type CognuitSidecarConfig = SidecarConfig & {
  cognuitApiBaseUrl: string;
  cognuitCdfProject: string;
  cogniteSupportUrl: string;
};

// we are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
(window as any).__cogniteSidecar = {
  ...getDefaultSidecar({
    prod: false,
    cluster: 'ew1',
  }),
  __sidecarFormatVersion: 1,
  aadApplicationId: '',
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'cognuit-dev',
  cognuitApiBaseUrl: 'https://cognuit-cognitedata-development.cognite.ai',
  cognuitCdfProject: 'subsurface-test',

  cogniteSupportUrl: 'https://cognite.zendesk.com',

  disableIntercom: true,
  disableTranslations: true,
  enableUserManagement: true,

  ...((window as any).__cogniteSidecar || {}),
};

export default (window as any).__cogniteSidecar as CognuitSidecarConfig;
