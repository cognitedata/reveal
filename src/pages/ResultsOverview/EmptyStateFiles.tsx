import { Graphic, Body } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import React from 'react';

const EmptyStateFiles = () => {
  return (
    <Flex column style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Graphic type="Recents" />
      <Body level={1} style={{ color: '#8C8C8C' }}>
        Results will be here
      </Body>
    </Flex>
  );
};

export default EmptyStateFiles;
