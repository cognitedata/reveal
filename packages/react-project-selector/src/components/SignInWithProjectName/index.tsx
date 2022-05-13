import React, { useContext, useEffect, useState } from 'react';

import LoginContext from '../../context';
import { Box } from '../common';
import useSpecifyCluster from '../../hooks/useSpecifyCluster';
import InfoMessage from '../common/InfoMessage';
import LoginScreen from '../common/LoginScreen';
import Input from '../common/Input';
import useLoginWithProjectName from '../../hooks/useLoginWithProjectName';

import WithSpecifiedCluster from './SpecifiedCluster';
import WithDefaultCluster from './DefaultCluster';

const SignInWithProjectName = () => {
  const { cluster, move } = useContext(LoginContext);
  const [projectName, setProjectName] = useState('');
  const [specifyCluster] = useSpecifyCluster();

  const { login, isLoading, isError } = useLoginWithProjectName(move);

  const doLogin = () => {
    login({ projectName, env: specifyCluster ? cluster : undefined });
  };

  useEffect(() => {
    document.getElementsByTagName('input')[0].focus();
  }, []);

  return (
    <LoginScreen backTo="/">
      <Box m={32}>
        <Box spaceY={20}>
          <InfoMessage
            id="signInWithProjectName"
            details="Enter the CDF project name. If you don’t know what to enter, contact your internal help desk or CDF admin."
          />
          <Input
            value={projectName}
            title="CDF project name"
            // input name is important for browser autofill to work
            name="project-name"
            error={isError ? 'Invalid project name.' : undefined}
            onChange={(v) => setProjectName(v.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && doLogin()}
          />
          {specifyCluster ? (
            <WithSpecifiedCluster
              projectName={projectName}
              loading={isLoading}
              login={doLogin}
            />
          ) : (
            <WithDefaultCluster
              projectName={projectName}
              loading={isLoading}
              login={doLogin}
            />
          )}
        </Box>
      </Box>
    </LoginScreen>
  );
};

export default SignInWithProjectName;
