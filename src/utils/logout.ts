import { CdfClient } from 'utils';
import * as Sentry from '@sentry/browser';

export const logout = async (
  client: CdfClient,
  shutdownIntercom: () => void
) => {
  const redirectUrl = `https://${window.location.host}/`;
  try {
    const logoutUrl = await client.cogniteClient.logout.getUrl({
      redirectUrl,
    });
    shutdownIntercom();
    if (logoutUrl) {
      window.location.href = logoutUrl;
    } else {
      Sentry.captureMessage('Logout: No logout URL', Sentry.Severity.Error);
    }
  } catch (error) {
    Sentry.captureException(error);
    window.location.pathname = redirectUrl as string;
  }
};
