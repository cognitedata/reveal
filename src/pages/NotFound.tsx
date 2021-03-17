import React from 'react';
import { Graphic } from '@cognite/cogs.js';
import { Flex, PageTitle } from 'components/Common';

export default function PageNotFound() {
  return (
    <>
      <PageTitle>Page not found</PageTitle>
      <Flex column align justify style={{ width: '100vw', height: '100vh' }}>
        <Graphic type="Documents" />
      </Flex>
    </>
  );
}
