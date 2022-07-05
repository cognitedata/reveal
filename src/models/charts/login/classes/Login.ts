import { getFlow } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import Config from 'models/charts/config/classes/Config';
import azureUserInfo from 'models/charts/login/services/azureUserInfo';
import identifyUser from 'models/charts/login/utils/identifyUser';
import Firebase from 'models/firebase/classes/Firebase';

export default class Login {
  static get cdfToken() {
    return Config.lsGet('cdfToken', '');
  }

  static set cdfToken(token: string) {
    Config.lsSave('cdfToken', token);
  }

  static get accessToken() {
    return Config.lsGet('accessToken', '');
  }

  static set accessToken(token: string) {
    Config.lsSave('accessToken', token);
  }

  private static saveLogin(
    cdfToken: string | null,
    azureADToken?: string | null
  ) {
    if (cdfToken) this.cdfToken = cdfToken;
    if (azureADToken) this.accessToken = azureADToken;
  }

  private static async oAuthLogin(
    sdk: CogniteClient,
    project: string,
    msftDirectory?: string,
    cluster = 'api'
  ) {
    if (!msftDirectory) throw new Error('No MSFT Azure AD Directory!');

    await sdk.loginWithOAuth({
      clientId: Config.azureAppId,
      cluster,
      tenantId: msftDirectory,
      signInType: { type: 'loginRedirect' },
    });
    await sdk.authenticate();
    const azureADToken = await sdk.getAzureADAccessToken();
    if (!azureADToken) throw new Error('Azure AD Login Failed!');

    const cdfToken = await sdk.getCDFToken();
    this.saveLogin(cdfToken, azureADToken);

    const userInfo = await azureUserInfo(azureADToken);
    identifyUser(userInfo, project, cluster, msftDirectory);
    return true;
  }

  private static async legacyLogin(
    sdk: CogniteClient,
    project: string,
    cluster = 'api'
  ) {
    if (cluster) sdk.setBaseUrl(`https://${cluster}.cognitedata.com`);

    const authenticated = await sdk.loginWithOAuth({ project });
    if (!authenticated) await sdk.authenticate();
    const token = await sdk.getCDFToken();
    this.saveLogin(token);

    const userInfo = await sdk.login.status();
    if (!userInfo) throw new Error('No Login Info!');

    identifyUser(
      { id: userInfo.user, email: userInfo.user, displayName: userInfo.user },
      userInfo.project,
      cluster
    );
    return true;
  }

  static login(sdk: CogniteClient, project: string, cluster?: string) {
    const { flow, options: { directory } = {} } = getFlow(project, cluster);
    switch (flow) {
      case 'AZURE_AD':
        return Login.oAuthLogin(sdk, project, directory, cluster).then(() =>
          Firebase.login(cluster, project, this.cdfToken)
        );
      case 'COGNITE_AUTH':
        return Login.legacyLogin(sdk, project, cluster).then(() =>
          Firebase.login(cluster, project, this.cdfToken)
        );
      default:
        throw new Error('Unsupported Authentication');
    }
  }
}
