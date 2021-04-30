import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { CogniteAuth, saveFlow } from '@cognite/auth-utils';
import AzureAdvancedOptions, {
  AzureAdvancedOptions as AzureAdvancedOptionsType,
} from '../AzureAdvancedOptions';

const LoginWithAzure = ({
  cluster,
  authClient,
  directory,
}: {
  cluster: string;
  authClient?: CogniteAuth;
  directory?: string;
}) => {
  const [
    azureAdvancedOptions,
    setAzureAdvancedOptions,
  ] = useState<AzureAdvancedOptionsType>({
    azureTenant: directory,
  });
  const handleClick = () => {
    if (authClient) {
      // console.log('Starting AZURE_AD login flow');
      saveFlow('AZURE_AD', { directory: azureAdvancedOptions.azureTenant });
      authClient.login('AZURE_AD', { cluster });
    }
  };

  return (
    <>
      <Button
        style={{ height: 40, width: '100%', marginTop: 10 }}
        size="large"
        type="secondary"
        onClick={handleClick}
      >
        Login with Microsoft Azure
      </Button>
      <AzureAdvancedOptions
        advancedOptions={azureAdvancedOptions}
        handleOnChange={(next) => {
          setAzureAdvancedOptions(next);
        }}
        handleSubmit={() => {
          saveFlow('AZURE_AD', { directory: azureAdvancedOptions.azureTenant });
          window.location.reload();
        }}
      />
    </>
  );
};

export default LoginWithAzure;
