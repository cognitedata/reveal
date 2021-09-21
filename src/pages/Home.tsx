import React from 'react';
import { Loader } from '@cognite/cogs.js';
import { PageTitle } from '@cognite/cdf-utilities';
import { workflowRoutes } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { Redirect, RouteComponentProps, Switch } from 'react-router-dom';

const Home = ({ location }: RouteComponentProps) => {
  // const user = useUserContext();

  return (
    <>
      <PageTitle title="Vision" />
      <Loader />
      <Container>
        <Switch>
          <Redirect
            to={{
              key: workflowRoutes.explore,
              pathname: workflowRoutes.explore,
              search: location.search,
            }}
          />
        </Switch>
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
