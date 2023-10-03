import { ParentSizeModern } from '@visx/responsive';
import styled from 'styled-components/macro';

import type {
  AggregateType,
  CalculationStep,
  InputTimeSeries,
} from '@cognite/simconfig-api-sdk/rtk';

import { TimeseriesChart } from '../../../../../components/charts/TimeseriesChart';
import { LoaderOverlay } from '../../../../CalculationConfiguration/elements';
import type {
  TimeseriesState,
  TimeseriesStateEntry,
} from '../../../../CalculationConfiguration/utils';

interface TimeSeriesPreviewProps {
  timeseriesState: TimeseriesState;
  step: CalculationStep;
  inputTimeseries: InputTimeSeries[];
  aggregateType: AggregateType | undefined;
}

const getTimeSerieByType = (
  inputTimeseries: TimeSeriesPreviewProps['inputTimeseries'],
  type: string
) => inputTimeseries.find((timeseries) => timeseries.type === type);

const renderEmptyChart = (
  datapoints: TimeseriesStateEntry['datapoints'] | undefined,
  sensorExternalId: string | undefined
) => {
  if (!sensorExternalId) {
    return <EmptyChart>No time series selected</EmptyChart>;
  }
  if (!datapoints?.length) {
    return <EmptyChart>No datapoints in current window</EmptyChart>;
  }
  return null;
};

export function TimeSeriesPreview({
  timeseriesState,
  step,
  inputTimeseries,
  aggregateType,
}: TimeSeriesPreviewProps) {
  const stepTimeseries = getTimeSerieByType(
    inputTimeseries,
    step.arguments.value ?? ''
  );

  if (timeseriesState.isLoading) {
    return (
      <div>
        <LoaderOverlay />
      </div>
    );
  }

  const datapoints =
    timeseriesState.timeseries[stepTimeseries?.sensorExternalId ?? '']
      ?.datapoints;

  return (
    <div>
      {datapoints?.length ? (
        <ParentSizeModern>
          {() => (
            <TimeseriesChart
              aggregateType={aggregateType}
              data={datapoints}
              height={200}
              tooltipEnabled={false}
              width={600}
              yAxisLabel={
                getTimeSerieByType(inputTimeseries, step.arguments.value ?? '')
                  ?.unitType ?? ''
              }
              fullSize
            />
          )}
        </ParentSizeModern>
      ) : (
        renderEmptyChart(datapoints, stepTimeseries?.sensorExternalId)
      )}
    </div>
  );
}

const EmptyChart = styled.div`
  box-shadow: 0 0 0 1px var(--cogs-border-default);
  border-radius: var(--cogs-border-radius--default);
  font-style: italic;
  opacity: 0.4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 600px;
  height: 200px;
`;
