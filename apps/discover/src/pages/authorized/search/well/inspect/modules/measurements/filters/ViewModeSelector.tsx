import React from 'react';

import { SegmentedControl } from '@cognite/cogs.js';

import { VIEW_MODES } from '../constants';

export interface Props {
  activeViewMode: string;
  onChange: (key: string) => void;
}

export const ViewModeSelector: React.FC<Props> = ({
  activeViewMode,
  onChange,
}) => {
  return (
    <SegmentedControl currentKey={activeViewMode} onButtonClicked={onChange}>
      {VIEW_MODES.map((viewMode) => (
        <SegmentedControl.Button key={viewMode}>
          {viewMode}
        </SegmentedControl.Button>
      ))}
    </SegmentedControl>
  );
};
