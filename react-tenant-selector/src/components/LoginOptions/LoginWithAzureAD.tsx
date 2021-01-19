import React from 'react';
import { Button } from '@cognite/cogs.js';
import { CogniteAuth } from '@cognite/auth-utils';

const LoginWithAzureAD = ({
  cluster,
  authClient,
}: {
  cluster: string;
  authClient?: CogniteAuth;
}) => {
  const handleClick = () => {
    if (authClient) {
      authClient.login('AZURE_AD_MULTI_TENANCY', { cluster });
    }
  };

  return (
    <Button
      style={{ height: 40, width: '100%', marginTop: 10 }}
      size="large"
      type="secondary"
      onClick={handleClick}
    >
      Login with Microsoft Azure
    </Button>
  );
};

export default LoginWithAzureAD;
