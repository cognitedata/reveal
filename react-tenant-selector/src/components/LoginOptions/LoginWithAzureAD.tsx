import React from 'react';
import { Button } from '@cognite/cogs.js';
import { CogniteAuth, saveFlow } from '@cognite/auth-utils';

const LoginWithAzureAD = ({
  cluster,
  authClient,
}: {
  cluster: string;
  authClient?: CogniteAuth;
}) => {
  const handleClick = () => {
    if (authClient) {
      // console.log('Starting AZURE_AD login flow');
      saveFlow('AZURE_AD');
      authClient.login('AZURE_AD', { cluster });
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
