import * as React from 'react';

import { SegmentedControl } from '@cognite/cogs.js';

import { ViewModeControlProps } from './types';

export const ViewModeControl = <T extends string>({
  views,
  selectedView,
  onChangeView,
}: ViewModeControlProps<T>) => {
  return (
    <SegmentedControl
      currentKey={selectedView}
      onButtonClicked={(view) => onChangeView(view as T)}
    >
      {views.map((view) => (
        <SegmentedControl.Button key={view} data-testid={`view-mode-${view}`}>
          {view}
        </SegmentedControl.Button>
      ))}
    </SegmentedControl>
  );
};
