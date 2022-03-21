import React, { useContext } from 'react';
import styled from 'styled-components';

import LoginContext from '../../context';

import { Card, Box, Flex, FatButton } from './index';
import LoginHeader from './LoginHeader';
import Back from './Back';

interface LoginScreenProps {
  backTo?: string;
  children: React.ReactNode;
}

const LoginScreen = ({ backTo, children }: LoginScreenProps) => {
  const { appName } = useContext(LoginContext);
  const goTo = (url: string) => () => window.open(url, '_blank')?.focus();

  return (
    <Card>
      <Flex direction="column" heightFull>
        <Box mt={32} ml={32} mr={32}>
          <LoginHeader appName={appName} />
        </Box>
        {backTo && (
          <Box mt={32}>
            <Back to={backTo} />
          </Box>
        )}
        <BoxScrollableOnSmallScreens flex={1}>
          {children}
        </BoxScrollableOnSmallScreens>
        <FatButton
          type="link"
          icon="ExternalLink"
          iconPlacement="right"
          onClick={goTo('https://docs.cognite.com/cdf/sign-in.html')}
        >
          Help
        </FatButton>
      </Flex>
    </Card>
  );
};

const BoxScrollableOnSmallScreens = styled(Box)`
  @media (max-height: 640px) {
    overflow-y: auto;
  }
`;

export default LoginScreen;
