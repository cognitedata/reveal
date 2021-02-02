export type AuthFlow = 'COGNITE_AUTH' | 'AZURE_AD' | 'ADFS' | 'OAUTH_GENERIC';

export type AuthResult = {
  idToken?: string;
  accessToken?: string;
  expTime?: number;
  authFlow: AuthFlow;
};

export type AuthResults = {
  [project: string]: AuthResult;
};
