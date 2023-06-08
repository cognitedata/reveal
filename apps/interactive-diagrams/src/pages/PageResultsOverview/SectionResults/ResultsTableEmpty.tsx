import React from 'react';

import { Flex } from '@interactive-diagrams-app/components/Common';

import { Body, Illustrations } from '@cognite/cogs.js';

export default function ResultsTableEmpty() {
  return (
    <Flex column align justify style={{ margin: '32px' }}>
      <Illustrations.Solo type="PAndIdAnalysis" />
      <Body level={1} style={{ color: '#8C8C8C' }}>
        Results will be here
      </Body>
    </Flex>
  );
}
