import * as React from 'react';

import { SegmentedControl } from 'components/SegmentedControl';

import { EventsColumnView } from '../../../../common/Events/types';

export interface EventsColumnViewControlProps {
  onChange: (view: EventsColumnView) => void;
}

export const EventsColumnViewControl: React.FC<
  EventsColumnViewControlProps
> = ({ onChange }) => {
  return (
    <SegmentedControl
      tabs={{
        [EventsColumnView.Cluster]: 'Cluster view',
        [EventsColumnView.Scatter]: 'Scatter view',
      }}
      currentTab={EventsColumnView.Cluster}
      onTabChange={(view) => onChange(view as EventsColumnView)}
    />
  );
};
