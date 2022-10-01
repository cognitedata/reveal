import { ParentSizeModern } from '@visx/responsive';

import styled from 'styled-components/macro';

import type {
  AggregateType,
  CalculationStep,
  InputTimeSeries,
} from '@cognite/simconfig-api-sdk/rtk';

import { TimeseriesChart } from 'components/charts/TimeseriesChart';
import type { TimeseriesState } from 'pages/CalculationConfiguration/utils';

import { LoaderOverlay } from '../../../../CalculationConfiguration/elements';

interface TimeSeriesPreviewProps {
  timeseriesState: TimeseriesState;
  step: CalculationStep;
  inputTimeseries: InputTimeSeries[];
  aggregateType: AggregateType | undefined;
}

export function TimeSeriesPreview({
  timeseriesState,
  step,
  inputTimeseries,
  aggregateType,
}: TimeSeriesPreviewProps) {
  const getTimeSerieByType = (type: string) =>
    inputTimeseries.find((timeserie) => timeserie.type === type);

  const stepTimeSerie = getTimeSerieByType(step.arguments.value ?? '');

  return (
    <div>
      {timeseriesState.isLoading && <LoaderOverlay />}
      {!timeseriesState.isLoading &&
      (timeseriesState.timeseries[stepTimeSerie?.sensorExternalId ?? '']
        ?.datapoints.length ?? 0) >= 1 ? (
        <ParentSizeModern>
          {() => (
            <TimeseriesChart
              aggregateType={aggregateType}
              data={
                timeseriesState.timeseries[
                  stepTimeSerie?.sensorExternalId ?? ''
                ]?.datapoints
              }
              height={200}
              tooltipEnabled={false}
              width={600}
              yAxisLabel={
                getTimeSerieByType(step.arguments.value ?? '')?.unitType ?? ''
              }
              fullSize
            />
          )}
        </ParentSizeModern>
      ) : (
        <EmptyChart>No datapoints in current window</EmptyChart>
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
