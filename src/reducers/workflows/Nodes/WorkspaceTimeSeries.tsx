import React from 'react';
import { AutoComplete } from '@cognite/cogs.js';
import sdk from 'services/CogniteSDK';
import { Chart } from 'reducers/charts';
import { calculateGranularity } from 'utils/timeseries';
import { StorableNode, ConfigPanelComponentProps } from '../types';

type FunctionData = {
  timeSeriesExternalId: string;
  context: {
    chart: Chart;
  };
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.timeSeriesExternalId) {
    throw new Error('No external id given in config');
  }

  const pointsPerSeries = 1000;

  const datapoints = await sdk.datapoints.retrieve({
    items: [{ externalId: funcData.timeSeriesExternalId }],
    start: new Date(funcData.context.chart.dateFrom || new Date()),
    end: new Date(funcData.context.chart.dateTo || new Date()),
    granularity: calculateGranularity(
      [
        new Date(funcData.context.chart.dateFrom).getTime(),
        new Date(funcData.context.chart.dateTo).getTime(),
      ],
      pointsPerSeries
    ),
    aggregates: ['average'],
    limit: 1000,
  });
  return {
    result: {
      datapoints: datapoints[0].datapoints,
      unit: datapoints[0].unit,
    },
  };
};

export const effectId = 'DATAPOINTS';

export const configPanel = ({
  node,
  onUpdateNode,
  context,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  const workspaceTimeSeries =
    (context.chart as Chart).timeSeriesCollection || [];

  const selectedWorkspaceTimeSeriesLabel =
    workspaceTimeSeries.find(
      ({ id }) => id === functionData.timeSeriesExternalId
    )?.name || '';

  const loadOptions = (
    _: string,
    callback: (options: { value?: string; label?: string }[]) => void
  ) => {
    callback(
      workspaceTimeSeries.map((result) => ({
        value: result.id,
        label: result.name,
      }))
    );
  };

  return (
    <div>
      <h4>Workspace Time Series</h4>
      <AutoComplete
        mode="async"
        theme="dark"
        loadOptions={loadOptions}
        onChange={(nextValue: { value: string; label: string }) => {
          onUpdateNode({
            title: nextValue.label,
            subtitle: `DATAPOINTS (${nextValue.value})`,
            functionData: {
              timeSeriesExternalId: nextValue.value,
            },
          });
        }}
        value={{
          value: functionData.timeSeriesExternalId,
          label: selectedWorkspaceTimeSeriesLabel,
        }}
      />
    </div>
  );
};

export const node = {
  title: 'Workspace Time Series',
  subtitle: 'DATAPOINTS',
  color: '#FC2574',
  icon: 'Function',
  inputPins: [],
  outputPins: [
    {
      id: 'result',
      title: 'Datapoints',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: effectId,
  functionData: {
    timeSeriesExternalId: undefined,
  },
} as StorableNode;
