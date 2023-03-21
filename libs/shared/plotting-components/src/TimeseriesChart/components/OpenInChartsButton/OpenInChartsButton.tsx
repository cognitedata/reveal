import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { openInCharts } from '../../utils/openInCharts';
import { DateRange } from '../../types';

export interface OpenInChartsButtonProps {
  timeseriesId: number;
  dateRange?: DateRange;
}

export const OpenInChartsButton: React.FC<OpenInChartsButtonProps> = ({
  timeseriesId,
  dateRange,
}) => {
  return (
    <Button
      role="link"
      size="small"
      type="ghost-accent"
      icon="LineChart"
      onClick={() => openInCharts({ timeseriesId, dateRange })}
    >
      Open in Charts
    </Button>
  );
};
