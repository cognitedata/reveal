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
