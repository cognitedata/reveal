import React from 'react';
import { Illustrations } from '@cognite/cogs.js';
import { Flex, PageTitle } from 'components/Common';

export default function PageNotFound() {
  return (
    <>
      <PageTitle title="Page not found" />
      <Flex column align justify style={{ width: '100vw', height: '70vh' }}>
        <Illustrations.Solo type="EmptyStateSearchSad" />
      </Flex>
    </>
  );
}
