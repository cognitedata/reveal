declare global {
  interface Window {
    testAuthOverrides?: TestAuthOverrides;
  }
}

export type UserInfo = {
  displayName?: string;
  id: string;
  mail?: string;
  userPrincipalName?: string;
};

export interface TestAuthOverrides {
  getToken: () => Promise<string>;
}
