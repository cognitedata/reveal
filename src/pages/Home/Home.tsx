import React, { useEffect } from 'react';
import { Button, Loader } from '@cognite/cogs.js';
import { useUserContext } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { handleUserIdentification } from 'utils/config';
import { useMetrics } from '@cognite/metrics';

const Home = () => {
  const user = useUserContext();
  const metrics = useMetrics('Demo');

  useEffect(() => {
    handleUserIdentification(user.username);
  }, [user]);

  return (
    <>
      <Loader />
      <Container>
        <p>Your Unified UI Subapp is now running! Congrats {user.username}!</p>
        <Button
          type="primary"
          onClick={() =>
            metrics.track('Button.Click', { demoProperty: 'demo value' })
          }
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
