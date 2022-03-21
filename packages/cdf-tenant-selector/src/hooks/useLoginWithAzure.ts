import { useCallback, useContext } from 'react';
import { CogniteClient } from '@cognite/sdk-v5';
import { useMutation } from 'react-query';

import LoginContext from '../context';
import { COGNITE_SDK_ACCOUNT_ID_KEY } from '../constants';
import {
  clearMsalStatus,
  clearUrlHash,
  isLoginError,
  removeAzureTokensFromLS,
} from '../utilities';
import { LoginParams } from '../types';

let sdk: null | CogniteClient = null;

export const getSdk = () => {
  if (!sdk) throw new Error('SDK null');
  return sdk;
};

const resetSdk = () => {
  sdk = new CogniteClient({
    appId: 'Fusion login',
  });
};

const doLogin = async (params: LoginParams) => {
  const {
    cluster,
    directory = '',
    prompt = 'select_account',
    clientId,
  } = params!;

  resetSdk();

  await getSdk().loginWithOAuth({
    type: 'AAD_OAUTH',
    options: {
      clientId,
      cluster: cluster || 'api',
      tenantId: directory,
      signInType: {
        type: 'loginRedirect',
        requestParams: {
          prompt,
        },
      },
    },
  });

  if (prompt === 'select_account') {
    await getSdk().authenticate();
  }
};

const useLoginWithAzure = () => {
  const { clientId } = useContext(LoginContext);
  const mutation = useMutation(
    (loginParams: LoginParams) => doLogin(loginParams),
    {
      onMutate: () => {
        if (isLoginError()) {
          clearUrlHash();
          clearMsalStatus(clientId);
        }
      },
    }
  );

  const logout = useCallback(async () => {
    window.localStorage.removeItem(COGNITE_SDK_ACCOUNT_ID_KEY);
    removeAzureTokensFromLS();
    resetSdk();
    mutation.reset();
  }, [mutation]);

  return {
    login: mutation.mutate,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    logout,
  };
};

export default useLoginWithAzure;
