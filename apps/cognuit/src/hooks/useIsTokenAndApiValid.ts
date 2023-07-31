import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, AuthProvider } from '@cognite/react-container';
import ApiContext from 'contexts/ApiContext';

export const useIsTokenAndApiValid = () => {
  const { api } = useContext(ApiContext);
  const { authState } = React.useContext<AuthContext>(AuthProvider);
  const { token } = authState || {};

  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (api && token && token !== 'NO_TOKEN') {
      setValid(true);
    }
  }, [api, token]);

  return valid;
};
