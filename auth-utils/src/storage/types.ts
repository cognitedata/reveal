export type AuthFlow =
  | 'COGNITE_AUTH'
  | 'AZURE_AD'
  | 'ADFS'
  | 'OAUTH_GENERIC'
  | 'FAKE_IDP' // used for E2E testing
  | 'UNKNOWN'; // set to this during logout

export type AuthResult = {
  idToken?: string;
  accessToken?: string;
  expTime?: number;
  authFlow: AuthFlow;
};

export type AuthResults = {
  [project: string]: AuthResult;
};
