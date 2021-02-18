import React from 'react';
import PageLayout from 'pages/PageLayout';
import { Title, Graphic } from '@cognite/cogs.js';
import { NoItemsContainer } from 'styles/common';

const ErrorPage = (): JSX.Element => (
  <PageLayout>
    <NoItemsContainer>
      <Graphic type="DataSets" />
      <Title level={5}>
        Something went wrong. Try refreshing the page or contact your
        administrator.
      </Title>
    </NoItemsContainer>
  </PageLayout>
);

export default ErrorPage;
