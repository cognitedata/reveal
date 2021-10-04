import { Graphic, Body } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import React from 'react';

export default function ResultsTableEmpty() {
  return (
    <Flex column align justify style={{ margin: '32px' }}>
      <Graphic type="Recents" />
      <Body level={1} style={{ color: '#8C8C8C' }}>
        Results will be here
      </Body>
    </Flex>
  );
}
