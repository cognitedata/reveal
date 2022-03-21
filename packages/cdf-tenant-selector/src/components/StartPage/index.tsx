import React from 'react';
import { useHistory } from 'react-router-dom';

import LoginScreen from '../common/LoginScreen';
import { Box } from '../common';

import Button from './Button';
import 'tippy.js/dist/tippy.css';

const StartPage: React.FC = () => {
  const history = useHistory();
  const navigateTo = (route: string) => () => history.push(route);

  return (
    <LoginScreen>
      <Box m={32}>
        <Box mb={10}>
          <div
            onClick={navigateTo('signInWithMicrosoft')}
            onKeyPress={navigateTo('signInWithMicrosoft')}
            role="button"
            tabIndex={0}
          >
            <Button
              icon="Microsoft"
              title="Sign in with Microsoft"
              chip="NEW"
            />
          </div>
        </Box>
        <div
          onClick={navigateTo('signInWithProjectName')}
          onKeyPress={navigateTo('signInWithProjectName')}
          role="button"
          tabIndex={0}
        >
          <Button icon="Edit" title="Sign in with project name" />
        </div>
      </Box>
    </LoginScreen>
  );
};

export default StartPage;
