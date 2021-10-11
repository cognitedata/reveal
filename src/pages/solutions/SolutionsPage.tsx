import { lazy, Suspense } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Spinner } from '../../components/Spinner/Spinner';
import { Solution } from './Solution';

const SolutionsList = lazy(() =>
  import('./SolutionsList').then((module) => ({
    default: module.SolutionsList,
  }))
);

export const SolutionsPage = () => {
  const { solutionId } = useParams<{
    solutionId: string;
  }>();

  // console.log('params-->', params);
  // const solutionId = params.;
  return (
    <Suspense fallback={<Spinner />}>
      <StyledWrapper>
        <Title level={3}>Solutions</Title>
        <Switch>
          <Route exact path={['/', '/solutions']}>
            <SolutionsList />
          </Route>
          <Route exact path="/solutions/:solutionId?">
            <Solution solutionId={solutionId} />
          </Route>
        </Switch>
        {/* <SolutionsList /> */}
      </StyledWrapper>
    </Suspense>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 53px 200px 0 200px;
`;
