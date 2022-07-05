import { UserInfo } from 'models/charts/login/types/UserInfo';

const azureUserInfo = async (azureADToken: string): Promise<UserInfo> => {
  const profile = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${azureADToken}`,
    },
  }).then((r) => r.json());
  return {
    id: profile.id ?? '',
    email: profile.mail ?? '',
    displayName: profile.displayName ?? '',
  };
};

export default azureUserInfo;
