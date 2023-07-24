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
  private service?: OidcService;

  getAppId() {
    return 'apps.cognite.com/cdf';
  }

  async getToken() {
    await this.initService();
    const token = this.service?.acquireTokenSilent(cluster);
    if (!token) {
      throw new Error('Token not found');
    }
    return token;
  }

  async getUserInformation() {
    await this.initService();
    const user = await this.service?.getUser();
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user?.id,
      mail: user?.email,
      displayName: user?.name,
      ...user,
    };
  }

  async getFlow() {
    await this.initService();
    // TODO: there's a likelihood of the idp type not matching what we've been
    // expecting in fusion until now. Now the `idp.type` comes from DLC, but we had
    // a slightly modified type in fusion.
    const flow = this.service?.idp.type as string;
    return { flow };
  }

  async logout() {
    await this.initService();
    this.service?.logout();
  }

  private async initService() {
    // Initialize the service if we don't have it.
    if (!this.service) {
      this.service = await getService();
    }
    // If the idp is different reinitialize the service.
    if (this.service.idp.internalId !== idpInternalId) {
      this.service = await getService();
    }
  }
}
