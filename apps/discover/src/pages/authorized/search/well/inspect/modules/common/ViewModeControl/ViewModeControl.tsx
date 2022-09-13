import * as React from 'react';

import { SegmentedControl } from '@cognite/cogs.js';

import { ViewModeControlProps } from './types';

export const ViewModeControl = <T extends string>({
  views,
  selectedView,
  onChangeView,
  size,
}: ViewModeControlProps<T>) => {
  return (
    <SegmentedControl
      currentKey={selectedView}
      onButtonClicked={(view) => onChangeView(view as T)}
      size={size}
    >
      {views.map((view) => (
        <SegmentedControl.Button key={view} data-testid={`view-mode-${view}`}>
          {view}
        </SegmentedControl.Button>
      ))}
    </SegmentedControl>
  );
};
