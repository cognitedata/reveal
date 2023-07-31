import { getSdk } from '../hooks/useLoginWithAzure';

const getUser = async () => {
  const token = await getSdk().getIdToken();

  if (!token) throw new Error('No token');

  const r = await fetch('https://graph.microsoft.com/v1.0/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await r.json();

  return res;
};

export default getUser;
