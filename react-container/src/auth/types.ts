interface BaseAuthResult {
  user: string;
}

export type ApiKeyAuthResult = BaseAuthResult & {
  idToken?: undefined;
  accessToken?: undefined;
};

export type OAuthAuthResult = BaseAuthResult & {
  idToken: string;
  accessToken: string;
};

export type AuthResult = ApiKeyAuthResult | OAuthAuthResult;

export function isOAuthAuthResult(
  authResult: AuthResult
): authResult is OAuthAuthResult {
  return (
    authResult.idToken !== undefined && authResult.accessToken !== undefined
  );
}

export interface DecodedIdToken {
  exp: number;
  sub: string;
  // eslint-disable-next-line camelcase
  project_name: string;
}
