import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { saveFlow, getFlow } from '@cognite/auth-utils';
import Tippy from '@tippyjs/react';

import ErrorMsg from '../common/ErrorMsg';
import LoginContext from '../../context';
import { commitLoginPage } from '../../utilities';
import { Box, Text } from '../common';
import Input from '../common/Input';
import InfoMessage from '../common/InfoMessage';
import LoginScreen from '../common/LoginScreen';
import ClusterSelect from '../common/ClusterSelect';
import { LoginParams } from '../../types';

interface GuestUserAccountProps {
  login: (params: LoginParams) => void;
  isLoading: boolean;
  isError: boolean;
}

const GuestUserAccount = ({
  login,
  isLoading,
  isError,
}: GuestUserAccountProps) => {
  const { cluster, clientId, clusters } = useContext(LoginContext);
  const { flow, options } = getFlow();
  const [directory, setDirectory] = useState<string | undefined>(() => {
    if (flow === 'AZURE_AD' && options?.directory) {
      return options?.directory;
    }

    return undefined;
  });

  useEffect(() => {
    if (isError) {
      // There was an error related to the tenant id
      // On this page visit, the error is being displayed
      // No need to display it (or the erroneous tenant) again on the next visit
      saveFlow('AZURE_AD', { directory: '' });
    }
  }, [isError]);

  const onContinueClick = () => {
    saveFlow('AZURE_AD', { directory: directory?.trim() });
    commitLoginPage('signInWithAsGuest');
    login({ cluster, directory, clientId });
  };

  return (
    <LoginScreen backTo="signInWithMicrosoft">
      <Box m={32}>
        <Box spaceY={20}>
          <InfoMessage
            id="guestUserAccountPage"
            title="Guest user accounts in Azure"
            details={
              <>
                Both{' '}
                <Tippy
                  content={
                    <Text color="white">
                      This is a UUID, such as:{' '}
                      <b>67c0fe2e-2515-11ec-9621-0242ac130002</b>.
                    </Text>
                  }
                >
                  <Text color="#536FFB">Azure Tenant ID</Text>
                </Tippy>{' '}
                and{' '}
                <Tippy
                  content={
                    <Text color="white">
                      This is a human readable name, such as{' '}
                      <b>contoso.onmicrosoft.com</b>.
                    </Text>
                  }
                >
                  <Text color="#536FFB">the domain name of the Azure AD</Text>
                </Tippy>{' '}
                are valid as Tenant ID. If you don’t have the ID contact your
                internal help desk or CDF admin.
              </>
            }
          />
          {window.location.hash.includes('error=') && <ErrorMsg />}
          <ClusterSelect clusters={clusters} />
          <Input
            value={directory}
            title="Tenant ID"
            error={
              isError
                ? 'Not a valid name. Check your spelling and try again.'
                : undefined
            }
            onKeyUp={(e) => e.key === 'Enter' && onContinueClick()}
            onChange={(v) => setDirectory(v.target.value)}
          />

          <Button
            block
            type="primary"
            variant="default"
            loading={isLoading}
            onClick={onContinueClick}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </LoginScreen>
  );
};

export default GuestUserAccount;
