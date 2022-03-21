import axios from 'axios';

const getBaseURL = (prod: boolean, cluster?: string) => {
  const clusterName = cluster && cluster !== 'api' ? `${cluster}.` : '';

  if (prod) {
    return `https://apps-api.staging.${clusterName}cognite.ai`;
  }

  return `https://apps-api.${clusterName}cognite.ai`;
};

const api = axios.create({});

export const validateTenant = async (
  prod: boolean,
  tenant: string,
  cluster?: string
) => {
  const requestParams = {
    params: {
      app: 'cdf',
      tenant,
      redirectUrl: window.location.origin,
    },
  };
  const response = await api.get<boolean>(
    `${getBaseURL(prod, cluster)}/tenant`,
    requestParams
  );
  return response.data;
};
