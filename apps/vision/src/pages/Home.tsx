import React from 'react';
import { Navigate } from 'react-router-dom';

import styled from 'styled-components';

import { getLink, workflowRoutes } from '@vision/utils/workflowRoutes';

import { PageTitle } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

const Home = () => {
  return (
    <>
      <PageTitle title="Vision" />
      <Loader />
      <Container>
        <Navigate to={getLink(workflowRoutes.explore)} replace />
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
