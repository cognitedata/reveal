import type { AuthResult } from '../storage';

export type AdfsConfig = {
  cluster: string;
  oidc: {
    clientId: string;
    authority: string;
    scope: string;
  };
};

type TokenResult = {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  scope: string;
  tokenType: string;
};

const defaultTokenResult: TokenResult = {
  accessToken: '',
  idToken: '',
  expiresIn: 0,
  scope: '/.default',
  tokenType: 'bearer',
};

class ADFS {
  private cluster: string;

  private clientId: string;

  private authority: string;

  private scope: string;

  private extraParams: {
    resource: string;
  };

  constructor(config: AdfsConfig) {
    this.cluster = config.cluster;
    this.clientId = config.oidc.clientId;
    this.authority = config.oidc.authority;
    this.scope = config.oidc.scope;
    this.extraParams = {
      resource: `https://${this.cluster}.cognitedata.com`,
    };
  }

  private responseMode = 'fragment';

  private responseType = 'id_token token';

  private state: AuthResult | undefined;

  // eslint-disable-next-line
  public processSigninResponse(): AuthResult | undefined {
    try {
      const url = window.location.href;
      const index = url.indexOf('#');

      if (index > -1 && url.length > index + 1) {
        const params = url
          .substring(index + 1, url.length)
          .split('&')
          .reduce<TokenResult>((acc, keyVal) => {
            const [key, val] = keyVal.split('=');
            return { ...acc, [key]: val };
          }, defaultTokenResult);

        const replaced = url.substring(0, index + 1);
        window.location.href = replaced;
        return {
          accessToken: params.accessToken,
          idToken: params.idToken,
          expTime: new Date().getTime() + params.expiresIn,
          authFlow: 'ADFS',
        };
      }
    } catch (e) {
      return undefined;
    }
  }

  public initAuth() {
    const authResult = this.processSigninResponse();
    if (
      authResult &&
      authResult.accessToken &&
      authResult.accessToken.length !== 0
    ) {
      this.state = authResult;
    }
  }

  public isSignedIn(): boolean {
    return !!(
      this.state &&
      this.state.idToken &&
      this.state.idToken.length > 0
    );
  }

  public async signInWithADFSRedirect(): Promise<void> {
    /* eslint-disable prettier/prettier */
    const url = `${this.authority}?client_id=${this.clientId}&redirect_uri=${
      window.location.href
    }&scope=${this.scope}&response_mode=${this.responseMode}&response_type=${
      this.responseType
    }&${Object.entries(this.extraParams).reduce(
      (acc, [key, val]) => `${acc}${key}=${val}`,
      ''
    )}`;
    window.location.href = url;
  }

  public clearState() {
    this.state = undefined;
  }

  public getAccessToken() {
    return this.state && this.state.accessToken;
  }

  public getIdToken() {
    return this.state && this.state.idToken;
  }
}

export default ADFS;
