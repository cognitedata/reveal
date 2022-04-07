export type AuthFlow =
  | 'COGNITE_AUTH'
  | 'AZURE_AD'
  | 'ADFS'
  | 'OAUTH_GENERIC'
  | 'FAKE_IDP' // Used for E2E testing
  | 'UNKNOWN'; // set to this during logout

export type AuthResult = {
  idToken?: string;
  accessToken?: string;
  expTime?: number;
  authFlow: AuthFlow;
};

export type FlowStorage = {
  flow: AuthFlow;
  options?: {
    cluster?: string;
    project?: string;
    directory?: string;
  };
};

export type AuthenticatedUser = {
  authenticated: boolean;
  initialising: boolean;
  project?: string;
  tenant?: string;
  token?: string;
  idToken?: string;
  error?: boolean;
  errorMessage?: string;
  username?: string;
  email?: string;
  id?: string;
};

export type TokenInspect = {
  subject: string;
  projects: { projectUrlName: string; groups: number[] }[];
};
