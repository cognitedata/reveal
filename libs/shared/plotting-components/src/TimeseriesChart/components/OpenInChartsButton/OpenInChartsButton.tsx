import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from '../../../useTranslation';
import { DateRange, TimeseriesItem } from '../../types';
import { openInCharts } from '../../utils/openInCharts';

import { ButtonWrapper } from './elements';

export interface OpenInChartsButtonProps {
  timeseries: TimeseriesItem[];
  dateRange?: DateRange;
}

export const OpenInChartsButton: React.FC<OpenInChartsButtonProps> = ({
  timeseries,
  dateRange,
}) => {
  const { t } = useTranslation();

  return (
    <ButtonWrapper>
      <Button
        role="link"
        size="small"
        type="ghost-accent"
        icon="LineChart"
        onClick={() => openInCharts({ timeseries, dateRange })}
      >
        {t('OPEN_IN_CHARTS', 'Open in Charts')}
      </Button>
    </ButtonWrapper>
  );
};
