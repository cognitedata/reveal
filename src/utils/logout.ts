import { CdfClient } from 'utils';

export const logout = async (client: CdfClient) => {
  const redirectUrl = `https://${window.location.host}/`;
  try {
    const logoutUrl = await client.cogniteClient.logout.getUrl({
      redirectUrl,
    });
    if (logoutUrl) {
      window.location.href = logoutUrl;
    } else {
      // eslint-disable-next-line no-console
      console.log('No logout URL');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    window.location.pathname = redirectUrl as string;
  }
};
