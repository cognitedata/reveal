import React from 'react';
import { Button, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { trackUsage } from '../../metrics';

const Home = () => {
  const { data, isLoading } = useUserInfo();
  const { displayName, email } = data ?? {};

  return (
    <>
      <Container>
        <p>
          Your Unified UI Subapp is now running! Congrats{' '}
          {isLoading ? <Loader /> : displayName}!
        </p>
        <Button
          type="primary"
          onClick={() => trackUsage('clicked-button', email)}
          disabled={isLoading}
        >
          My first Cog.js button
        </Button>
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default Home;
