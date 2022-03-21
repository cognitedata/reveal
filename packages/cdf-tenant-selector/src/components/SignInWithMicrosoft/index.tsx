import React, { useContext } from 'react';
import { saveFlow } from '@cognite/auth-utils';
import { Button } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';

import ErrorMsg from '../common/ErrorMsg';
import LoginContext from '../../context';
import { commitLoginPage } from '../../utilities';
import InfoMessage from '../common/InfoMessage';
import { Box } from '../common';
import Or from '../common/Or';
import ClusterSelect from '../common/ClusterSelect';
import LoginScreen from '../common/LoginScreen';
import { LoginParams } from '../../types';

interface SignInWithMicrosoftProps {
  login: (params: LoginParams) => void;
  isLoading: boolean;
}

const SignInWithMicrosoft = ({
  login,
  isLoading,
}: SignInWithMicrosoftProps) => {
  const { cluster, clientId, clusters } = useContext(LoginContext);

  const history = useHistory();

  const onContinue = () => {
    saveFlow('AZURE_AD', {});
    commitLoginPage('signInWithMicrosoft');
    login({ cluster, clientId });
  };

  return (
    <LoginScreen backTo="/">
      <Box m={32}>
        <Box spaceY={20}>
          <InfoMessage
            id="signInWithMicrosoftPage"
            details="Select the cluster where your organization’s CDF project is running. If you don’t know which cluster to select, contact your internal help desk or CDF admin."
          />
          {window.location.hash.includes('error=') && <ErrorMsg />}
          <ClusterSelect clusters={clusters} />
          <Button
            block
            type="primary"
            loading={isLoading}
            variant="default"
            onClick={onContinue}
          >
            Continue
          </Button>
          <Or />
          <Button
            block
            type="secondary"
            variant="default"
            onClick={() => history.push('signInWithAsGuest')}
          >
            Sign in as guest user
          </Button>
        </Box>
      </Box>
    </LoginScreen>
  );
};

export default SignInWithMicrosoft;
