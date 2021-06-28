/* eslint-disable camelcase */

export type IntercomBootSettings = {
  app_id: string;
  name?: string;
  email?: string;
  user_id?: string;
  hide_default_launcher: boolean;
};

export type IdentityVerificationSettings = {
  appsApiUrl: string;
  project?: string;
  headers: AuthHeaders;
};

/*
 ** [keys: string] keys are used here to allow for object[key] notation
 */
export type IntercomUpdateSettings = {
  name?: string;
  email?: string;
  hide_default_launcher?: boolean;
  horizontal_padding?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [keys: string]: any;
};

export type ForbiddenUpdateKey = {
  user_id: boolean;
  [keys: string]: boolean;
};

// need to type this API_KEY part properly
export type AuthHeaders =
  | { Authorization: string }
  | { [API_KEY: string]: string };

export type GetHmacSettings = {
  hmac: string;
  userUid: string;
};
