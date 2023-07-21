import {
  OidcService,
  getDlc,
  getIdp,
  readLoginHints,
} from '@cognite/auth-react/src/lib/base';

import { SdkClientTokenProvider } from './types';

// TODO: we need a way to read the url login hints as well, but need to make
// sure they're always present if we want to rely on them.
const { organization, cluster, idpInternalId } = readLoginHints() ?? {};

const getService = async () => {
  if (!organization || !idpInternalId || !cluster) {
    return Promise.reject(new Error('Missing login hints'));
  }
  const dlc = await getDlc(organization);
  const idp = await getIdp(dlc.idps, idpInternalId);
  if (!idp) {
    return Promise.reject(new Error('Missing idp'));
  }
  return new OidcService(idp, organization, cluster);
};

export class UnifiedSigninTokenProvider implements SdkClientTokenProvider {
  getAppId() {
    return 'apps.cognite.com/cdf';
  }

  async getToken() {
    const service = await getService();
    return service.acquireTokenSilent(cluster);
  }

  async getUserInformation() {
    const service = await getService();
    return service.getUser();
  }

  async getFlow() {
    const service = await getService();
    return { flow: service.idp.type as string };
  }

  async logout() {
    const service = await getService();
    service.logout();
  }
}
