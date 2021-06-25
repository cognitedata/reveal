import { AuthContext, AuthProvider } from '@cognite/react-container';
import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import React, { useContext } from 'react';
import { useQuery } from 'react-query';
import { CONFIGURATIONS_KEYS } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';

const useConfigurationsQuery = () => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);
  const { authState } = React.useContext<AuthContext>(AuthProvider);
  const { token } = authState || {};

  return useQuery(
    CONFIGURATIONS_KEYS.getAll,
    async () => {
      return api!.configurations.get();
    },
    {
      enabled: !!(token && token !== 'NO_TOKEN'),
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );
};

export { useConfigurationsQuery };
