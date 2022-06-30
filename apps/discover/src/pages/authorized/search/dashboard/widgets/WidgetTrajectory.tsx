import { useTrajectoriesQuery } from 'domain/wells/trajectory/internal/queries/useTrajectoriesQuery';

import * as React from 'react';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetTrajectory: React.FC = () => {
  return <WidgetLoader title="Trajectory" query={useTrajectoriesQuery} />;
};
