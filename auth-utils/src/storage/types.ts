export type AuthFlow =
  | 'COGNITE_AUTH'
  | 'AZURE_AD'
  | 'ADFS'
  | 'OAUTH_GENERIC'
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
