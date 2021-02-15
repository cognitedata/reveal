import React from 'react';
import { Loader } from '@cognite/cogs.js';
import { createLink, PageTitle, useUserContext } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Home = () => {
  const user = useUserContext();

  return (
    <>
      <PageTitle title="Vision" />
      <Loader />
      <Container>
        <p>Your Unified UI Subapp is now running! Congrats {user.username}!</p>
        <Link to={createLink('/vision/workflow/upload')}>
          Go to upload page
        </Link>
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
