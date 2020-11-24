import React, { Suspense } from 'react';
import { Loader, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import IntegrationsTabs from '../../components/tabs/IntegrationsTabs';

const IntegrationsTitle = styled((props) => (
  <Title {...props}>{props.children}</Title>
))`
  padding-right: 1.875rem;
  padding-left: 2rem;
  margin: 1.5rem 0 0.75rem 0;
  font-size: 1.5rem;
`;

const Home = () => {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Wrapper>
          <IntegrationsTitle level={1}>Integrations</IntegrationsTitle>
          <IntegrationsTabs />
        </Wrapper>
      </Suspense>
    </>
  );
};

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
`;
export default Home;
