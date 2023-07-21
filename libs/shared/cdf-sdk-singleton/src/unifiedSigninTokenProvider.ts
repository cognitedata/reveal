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

export class UnifiedSigninTokenProvider implements SdkClientTokenProvider {
  private service: OidcService | undefined;

  getAppId() {
    return 'apps.cognite.com/cdf';
  }

  async getToken() {
    await this.initService();
    const token = await this.service?.acquireTokenSilent(cluster);
    if (!token) {
      throw new Error('Failed to get token');
    }
    return token;
  }

  async getUserInformation() {
    await this.initService();
    return this.service?.getUser();
  }

  async getFlow() {
    await this.initService();
    return { flow: this.service?.idp.type as string };
  }

  async logout() {
    await this.initService();
    this.service?.logout();
  }

  private async initService() {
    if (!this.service) {
      this.service = await this.getService();
    }
    // If the IdP has changed, we need to reinitialize the service.
    if (this.service.idp.internalId !== idpInternalId) {
      this.service = await this.getService();
    }
  }

  private async getService() {
    if (!organization || !idpInternalId || !cluster) {
      return Promise.reject(new Error('Missing login hints'));
    }
    const dlc = await getDlc(organization);
    const idp = await getIdp(dlc.idps, idpInternalId);
    if (!idp) {
      return Promise.reject(new Error('Missing idp'));
    }
    return new OidcService(idp, organization, cluster);
  }
}
