import * as React from 'react';

import { useAllTrajectoriesQuery } from 'modules/wellSearch/hooks/useAllTrajectoriesQuery';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetTrajectory: React.FC = () => {
  return <WidgetLoader title="Trajectory" query={useAllTrajectoriesQuery} />;
};
