import React, { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { LazyWrapper } from '../modules/Common/Components/LazyWrapper';
import { VerticalContainer } from '../modules/Common/Components/VerticalContainer';
import { ProcessFileDetailsContainer } from '../modules/Process/Containers/ProcesseFileDetailsContainer/ProcesseFileDetailsContainer';
import { StatusToolBar } from '../modules/Process/Containers/StatusToolBar';
import { workflowRoutes } from '../utils/workflowRoutes';

const ProcessStep = () => {
  const compRoute = useMemo(
    () => () => import('../modules/Process/Containers/ProcessStep'),
    []
  );

  return <LazyWrapper importFn={compRoute} />;
};

export default function Process() {
  const { search } = useLocation();
  return (
    <VerticalContainer>
      <StatusToolBar current="Contextualize Imagery Data" previous="explorer" />
      <MainContent>
        <MainContainer>
          <Routes>
            <Route
              path={workflowRoutes.upload}
              element={
                <Navigate
                  to={{
                    pathname: 'process',
                    search,
                  }}
                  replace
                />
              }
            />
            <Route path="process" element={<ProcessStep />} />
          </Routes>
        </MainContainer>
        <ProcessFileDetailsContainer />
      </MainContent>
    </VerticalContainer>
  );
}

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const MainContainer = styled.div`
  flex: 1;
  min-width: 900px; /* totally random, but mocks have one size for now */

  /* the same padding is used in SubAppWrapper but it's disabled to make bottom nav looking right */
  padding: 20px;
  @media (min-width: 992px) {
    padding: 20px 40px;
  }
  display: flex;
  flex-direction: column;
  height: auto;
  box-sizing: content-box;
`;
