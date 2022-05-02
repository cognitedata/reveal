import { RefObject } from 'react';

import isEmpty from 'lodash/isEmpty';

import { ChartTitles, ChartTitlesProps } from './common/ChartTitles';
import {
  ChartZoomActions,
  ChartZoomActionsProps,
} from './common/ChartZoomActions';
import { Legend, LegendProps } from './common/Legend';
import { getCheckedLegendCheckboxOptions } from './common/Legend/utils';
import { NoDataAvailable } from './common/NoDataAvailable';
import { ResetToDefault } from './common/ResetToDefault';
import { ChartDetailsContainer, ChartWrapper } from './elements';
import { DataObject } from './types';

export interface Props<T> extends ChartTitlesProps {
  id: string;
  data: T[];
  className: string;
  chartRef: RefObject<HTMLDivElement>;
  zoomActions: ChartZoomActionsProps;
  legendProps: LegendProps;
  renderChart: () => JSX.Element;
  handleResetToDefault?: () => void;
}

export const BaseChart = <T extends DataObject<T>>({
  id,
  data,
  className,
  chartRef,
  title,
  subtitle,
  zoomActions,
  legendProps,
  renderChart,
  handleResetToDefault,
}: Props<T>) => {
  const checkedLegendCheckboxOptions = getCheckedLegendCheckboxOptions(
    legendProps.legendCheckboxState
  );

  const renderContentConditionally = () => {
    if (isEmpty(data)) {
      return <NoDataAvailable />;
    }
    if (isEmpty(checkedLegendCheckboxOptions)) {
      return <ResetToDefault handleResetToDefault={handleResetToDefault} />;
    }
    return renderChart();
  };

  return (
    <ChartWrapper data-testid={id} ref={chartRef} className={className}>
      <ChartDetailsContainer className="chart-details">
        <ChartTitles title={title} subtitle={subtitle} />
        <ChartZoomActions {...zoomActions} />
      </ChartDetailsContainer>

      {renderContentConditionally()}

      {!isEmpty(data) && <Legend id={id} {...legendProps} />}
    </ChartWrapper>
  );
};
