import React from 'react';

import { Flex, PageTitle } from '@interactive-diagrams-app/components/Common';

import { Illustrations } from '@cognite/cogs.js';

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
