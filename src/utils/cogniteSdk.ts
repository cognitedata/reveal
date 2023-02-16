import { CogniteClient } from '@cognite/sdk';

let client: CogniteClient;
let authFlow: any;
let userInformation: any;

export const getCogniteSDKClient = () => client;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};

export const getFlow = () => {
  return process.env.REACT_APP_IS_MOCK
    ? ({ flow: 'FAKE_IDP' } as any)
    : authFlow;
};

export const setFlow = (flow: any) => {
  authFlow = flow;
};

export const getUserInformation = () => {
  return process.env.REACT_APP_IS_MOCK
    ? ({
        email: 'mock@cognite.com',
        loggedIn: true,
        project: 'mock',
        id: '123456789',
      } as any)
    : userInformation;
};

export const setUserInformation = (userInfo: any) => {
  userInformation = userInfo;
};
