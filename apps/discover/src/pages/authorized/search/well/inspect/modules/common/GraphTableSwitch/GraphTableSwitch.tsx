import React from 'react';

import { SegmentedControl } from '@cognite/cogs.js';

import { Wrapper } from './elements';

export interface Props {
  viewMode: string;
  onChange: (key: string) => void;
}

export const VIEW_MODES = {
  Graph: 'Graph',
  Table: 'Table',
};

export const GraphTableSwitch: React.FC<Props> = ({ viewMode, onChange }) => {
  const { Graph, Table } = VIEW_MODES;
  return (
    <Wrapper>
      <SegmentedControl currentKey={viewMode} onButtonClicked={onChange}>
        <SegmentedControl.Button key={Graph}>{Graph}</SegmentedControl.Button>
        <SegmentedControl.Button key={Table}>{Table}</SegmentedControl.Button>
      </SegmentedControl>
    </Wrapper>
  );
};
