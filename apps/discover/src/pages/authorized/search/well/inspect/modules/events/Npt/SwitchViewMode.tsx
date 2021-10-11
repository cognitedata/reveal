import React from 'react';

import { SegmentedControl } from '@cognite/cogs.js';

import { VIEW_MODES } from './constants';
import { SwitchViewModeWrapper } from './elements';

interface Props {
  activeViewMode: string;
  onChangeViewMode: (key: string) => void;
}

export const SwitchViewMode: React.FC<Props> = ({
  activeViewMode,
  onChangeViewMode,
}) => {
  const { Graph, Table } = VIEW_MODES;

  return (
    <SwitchViewModeWrapper>
      <SegmentedControl
        currentKey={activeViewMode}
        onButtonClicked={onChangeViewMode}
      >
        <SegmentedControl.Button key={Graph}>{Graph}</SegmentedControl.Button>
        <SegmentedControl.Button key={Table}>{Table}</SegmentedControl.Button>
      </SegmentedControl>
    </SwitchViewModeWrapper>
  );
};
