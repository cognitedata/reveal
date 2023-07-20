import {
  OidcService,
  getDlc,
  getIdp,
  readLoginHints,
} from '@cognite/auth-react/src/lib/base';

import { SdkClientTokenProvider } from './types';

const { organization, cluster, idpInternalId } = readLoginHints() ?? {};

export class UnifiedSigninTokenProvider implements SdkClientTokenProvider {
  private service: OidcService | undefined;
  getAppId() {
    return 'apps.cognite.com/cdf';
  }

  async getToken() {
    const service = await this.getService();
    return service.acquireTokenSilent(cluster);
  }

  async getUserInformation() {
    const service = await this.getService();
    return service.getUser();
  }

  getFlow() {
    if (!this.service) {
      return Promise.reject(new Error('Service is not initialized'));
    }
    return { flow: this.service.idp.type as string };
  }

  async logout() {
    const service = await this.getService();
    service.logout();
  }

  private async getService() {
    if (!this.service) {
      if (!organization) {
        return Promise.reject(new Error('Missing login hints'));
      }
      const dlc = await getDlc(organization);
      const idp = await getIdp(dlc.idps, idpInternalId);
      if (!idp) {
        return Promise.reject(new Error('Missing idp'));
      }
      this.service = new OidcService(idp, organization, cluster);
    }

    return this.service;
  }
}
