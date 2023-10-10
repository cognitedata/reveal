import * as React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from '../../../useTranslation';
import { DateRange, TimeseriesItem } from '../../types';
import { getOpenInChartsLink } from '../../utils/openInCharts';

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
    <Link to={getOpenInChartsLink({ timeseries, dateRange })} target="_blank">
      <ButtonWrapper>
        <Button size="small" type="ghost-accent" icon="LineChart">
          {t('OPEN_IN_CHARTS', 'Open in Charts')}
        </Button>
      </ButtonWrapper>
    </Link>
  );
};
