import { RefObject, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { useDeepEffect } from 'hooks/useDeep';

import { ChartTitles, ChartTitlesProps } from './common/ChartTitles';
import {
  ChartZoomActions,
  ChartZoomActionsProps,
} from './common/ChartZoomActions';
import { Legend, LegendProps } from './common/Legend';
import { getCheckedLegendCheckboxOptions } from './common/Legend/utils';
import { LoadingState } from './common/LoadingState';
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
  const [chartRendering, setChartRendering] = useState<boolean>(true);

  const checkedLegendCheckboxOptions = getCheckedLegendCheckboxOptions(
    legendProps.legendCheckboxState
  );

  /**
   * UI gets freezed during the initial render.
   * Hence, showing a loading state while the chart is rendering.
   */
  useDeepEffect(() => {
    setChartRendering(
      isEmpty(data) || isEmpty(legendProps.legendCheckboxState)
    );
  }, [data, legendProps.legendCheckboxState]);

  const renderContentConditionally = () => {
    if (chartRendering) {
      return <LoadingState />;
    }
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

      {!chartRendering && !isEmpty(data) && <Legend id={id} {...legendProps} />}
    </ChartWrapper>
  );
};
