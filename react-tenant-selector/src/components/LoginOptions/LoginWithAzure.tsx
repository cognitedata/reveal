import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { CogniteAuth } from '@cognite/auth-utils';
import AzureAdvancedOptions, {
  AzureAdvancedOptions as AzureAdvancedOptionsType,
} from '../AzureAdvancedOptions';

const LoginWithAzure = ({
  authClient,
  directory,
}: {
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
      authClient.loginInitial({
        flow: 'AZURE_AD',
        directory: azureAdvancedOptions.azureTenant,
      });
    }
  };

  return (
    <>
      <Button
        style={{ height: 40, width: '100%', marginTop: 10 }}
        size="default"
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
      />
    </>
  );
};

export default LoginWithAzure;
