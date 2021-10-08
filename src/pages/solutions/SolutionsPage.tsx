import React, { lazy, Suspense } from 'react';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Spinner } from '../../components/Spinner/Spinner';

const SolutionsList = lazy(() =>
  import('./SolutionsList').then((module) => ({
    default: module.SolutionsList,
  }))
);

export const SolutionsPage = () => (
  <Suspense fallback={<Spinner />}>
    <Wrapper>
      <Title level={3}>Solutions</Title>
      <SolutionsList />
    </Wrapper>
  </Suspense>
);

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 53px 200px 0 200px;
`;
