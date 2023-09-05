export type UserInfo = {
  displayName?: string;
  id: string;
  mail?: string;
  userPrincipalName?: string;
  profilePicture?: string; // if defined, then a URL to the picture
};

export interface SdkClientTokenProvider {
  getAppId: () => string;
  getToken: () => Promise<string>;
  getUserInformation: () => Promise<UserInfo | User>;
  getFlow: () => { flow: string } | Promise<{ flow: string }>;
  logout: () => Promise<void>;
}
