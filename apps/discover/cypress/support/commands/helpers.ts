import axios, { AxiosRequestConfig } from 'axios';

// import { getDefaultSidecar } from '@cognite/sidecar';

const rawHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const getPostBody = (
  env: { [key: string]: any },
  isAdmin?: boolean
): AxiosRequestConfig => {
  return {
    url: `http://localhost:8200/login/token`,
    method: 'POST',
    data: {
      cluster: env.CLUSTER,
      fakeApplicationId:
        env.CLUSTER === 'bluefield'
          ? '1f860e84-7353-4533-a088-8fbe3228400f' // bluefield
          : '808c3e2e-7bc1-4211-8d9e-66b4a7a37d48', // azure-dev
      groups: ['defaultGroup', 'writeGroup'],
      roles: [],
      project: env.PROJECT,
      tokenId: `discover-${env.USER_PREFIX}`,
      userId: `${isAdmin ? 'admin-' : ''}${env.REACT_APP_E2E_USER}`,
    },
    headers: rawHeaders,
  };
};

// This can't be called from the plugins file as it can't resolve @cognite/sidecar
export const addSidecarConfigToEnv = (
  config: Cypress.Config
): Cypress.Config => {
  return {
    ...config,
    env: {
      ...config.env,
      // SIDECAR: getDefaultSidecar({
      //   prod: false,
      //   cluster: config.env.CLUSTER,
      //   localServices: ['fake-idp'],
      // }),
    },
  };
};

export const addTokensToEnv = async (
  config: Cypress.Config
): Promise<Cypress.Config> => {
  const [userResponse, adminResponse] = await Promise.all([
    axios(getPostBody(config.env)),
    axios(getPostBody(config.env, true)),
  ]);

  return {
    ...config,
    env: {
      ...config.env,
      ID_TOKEN: userResponse.data.id_token,
      ACCESS_TOKEN: userResponse.data.access_token,
      ID_TOKEN_ADMIN: adminResponse.data.id_token,
      ACCESS_TOKEN_ADMIN: adminResponse.data.access_token,
    },
  };
};

export const getTokenHeaders = (isAdmin = false, accessToken?: boolean) => {
  if (accessToken) {
    return {
      token: isAdmin
        ? Cypress.env('ACCESS_TOKEN_ADMIN')
        : Cypress.env('ACCESS_TOKEN'),
    };
  }

  return {
    ...rawHeaders,
    Authorization: `Bearer ${
      isAdmin ? Cypress.env('ID_TOKEN_ADMIN') : Cypress.env('ID_TOKEN')
    }`,
  };
};

export const deleteE2EUsers = async (config: Cypress.Config) => {
  console.log('Deleting Unique generated users...');

  const removeNormalUser = axios({
    // url: `${results.config.env.SIDECAR.userManagementServiceBaseUrl}/user/me`,
    url: `https://user-management-service.staging.${config.env.CLUSTER}.cognite.ai/user/me`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.env.ID_TOKEN}`,
    },
  });

  const removeAdminUser = axios({
    // url: `${results.config.env.SIDECAR.userManagementServiceBaseUrl}/user/me`,
    url: `https://user-management-service.staging.${config.env.CLUSTER}.cognite.ai/user/me`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.env.ID_TOKEN_ADMIN}`,
    },
  });

  await Promise.all([removeNormalUser, removeAdminUser])
    .then(() => {
      console.log('Deleted successfully');
    })
    .catch((err) => {
      console.error(err);
    });
};
