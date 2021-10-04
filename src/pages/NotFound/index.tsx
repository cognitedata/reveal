import React from 'react';
import { Graphic } from '@cognite/cogs.js';
import { Flex, PageTitle } from 'components/Common';

export default function PageNotFound() {
  return (
    <>
      <PageTitle title="Page not found" />
      <Flex column align justify style={{ width: '100vw', height: '70vh' }}>
        <Graphic type="Documents" />
      </Flex>
    </>
  );
}
