import * as React from 'react';
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
  const [azureAdvancedOptions, setAzureAdvancedOptions] =
    React.useState<AzureAdvancedOptionsType>({
      azureTenant: directory,
    });

  const [loading, setLoading] = React.useState(false);

  let possibleReloader: ReturnType<typeof setTimeout>;

  const handleClick = () => {
    if (authClient && !loading) {
      // console.log('Starting AZURE_AD login flow');
      setLoading(true);
      authClient.loginInitial({
        flow: 'AZURE_AD',
        directory: azureAdvancedOptions.azureTenant,
      });

      // reload to force the next stage
      // if the auto-redirect does not kick in
      possibleReloader = setTimeout(() => {
        // reload only if we have not already re-directed
        if (window.location.href === '/') {
          window.location.href = '/';
        }
      }, 2000);
    }
  };

  React.useEffect(() => {
    return () => {
      if (possibleReloader) {
        clearTimeout(possibleReloader);
      }
    };
  }, []);

  return (
    <>
      <Button
        style={{ height: 40, width: '100%', marginTop: 10 }}
        size="default"
        type="secondary"
        loading={loading}
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
