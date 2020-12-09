export type AuthFlow =
  | 'COGNITE_AUTH'
  | 'AZURE_AD_MULTI_TENANCY'
  | 'ADFS'
  | 'OAUTH_GENERIC';

export type AuthResult = {
  idToken?: string;
  accessToken?: string;
  expTime?: number;
  authFlow: AuthFlow;
};

export type AuthResults = {
  [project: string]: AuthResult;
};

// fusion.cognite.com/daitya/explorer?param=123
// storageObj['daitya'] ..> { authFlow: 'ADFS', accessToken: '123'}

// fusion.cognite.com
// storageObj[''] --> undefined;
// user select login with adfs
// storageObj['__noproject__'] ..> { authFlow: 'ADFS', accessToken: undefined }

// fusion.cognite.com#id_token=123&access_token=123
// might be adfs (custom logic) might not perform verification(?)
// might be aad (@azure/msal-browser) perform verification of tokens
// might be google oauth (oidc-client / custom logic)

// list projects
// user select project
// storageObj['__noproject__'] -> undefined
// storageObj['daitya'] -> { authFlow: 'ADFS', accessToken: '123'}
// redirects --> fusion.cognite.com/daitya
