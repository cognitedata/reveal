import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { DateRange } from '../../types';
import { openInCharts } from '../../utils/openInCharts';

import { ButtonWrapper } from './elements';

export interface OpenInChartsButtonProps {
  timeseriesId: number;
  dateRange?: DateRange;
}

export const OpenInChartsButton: React.FC<OpenInChartsButtonProps> = ({
  timeseriesId,
  dateRange,
}) => {
  return (
    <ButtonWrapper>
      <Button
        role="link"
        size="small"
        type="ghost-accent"
        icon="LineChart"
        onClick={() => openInCharts({ timeseriesId, dateRange })}
      >
        Open in Charts
      </Button>
    </ButtonWrapper>
  );
};
