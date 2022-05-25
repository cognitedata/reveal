import { useAllTrajectoriesQuery } from 'domain/wells/trajectory/dataLayer/queries/useAllTrajectoriesQuery';

import * as React from 'react';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetTrajectory: React.FC = () => {
  return <WidgetLoader title="Trajectory" query={useAllTrajectoriesQuery} />;
};
