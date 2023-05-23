import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';

export const getAuth0Client = (
  clientId: string,
  domain: string,
  audience?: string
) =>
  createAuth0Client({
    domain: domain,
    client_id: clientId,
    audience,
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
    redirect_uri: window.location.href,
  });

export const getAuth0Token = async (auth0P: Promise<Auth0Client>) => {
  try {
    const auth0 = await auth0P;
    if (!auth0) {
      return undefined;
    }
    const token = await auth0.getTokenSilently({ timeoutInSeconds: 3 });

    return token;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return undefined;
  }
};
