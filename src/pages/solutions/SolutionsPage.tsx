import { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Spinner } from '../../components/Spinner/Spinner';

const SolutionsList = lazy(() =>
  import('./SolutionsList').then((module) => ({
    default: module.SolutionsList,
  }))
);

const Solution = lazy(() =>
  import('./Solution').then((module) => ({
    default: module.Solution,
  }))
);

export const SolutionsPage = () => (
  <StyledWrapper>
    <Switch>
      <Route exact path={['/', '/solutions']}>
        <Suspense fallback={<Spinner />}>
          <SolutionsList />
        </Suspense>
      </Route>
      <Route exact path="/solutions/:solutionId?/:tabKey?">
        <Suspense fallback={<Spinner />}>
          <Solution />
        </Suspense>
      </Route>
    </Switch>
  </StyledWrapper>
);

const StyledWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
`;
