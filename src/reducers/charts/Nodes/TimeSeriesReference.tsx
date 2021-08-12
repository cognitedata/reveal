import { AutoComplete } from '@cognite/cogs.js';
import { Chart, StorableNode } from 'reducers/charts/types';
import { ConfigPanelComponentProps } from '../types';

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

  return {
    result: {
      externalId: funcData.timeSeriesExternalId,
    },
  };
};

export const effectId = 'TIME_SERIES_REFERENCE';

export const ConfigPanel = ({
  node,
  onUpdateNode,
  context,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  const workspaceTimeSeries =
    (context.chart as Chart).timeSeriesCollection || [];

  const selectedWorkspaceTimeSeriesLabel =
    workspaceTimeSeries.find(
      ({ tsExternalId }) => tsExternalId === functionData.timeSeriesExternalId
    )?.name || '';

  const loadOptions = (
    _: string,
    callback: (options: { value?: string; label?: string }[]) => void
  ) => {
    callback(
      workspaceTimeSeries.map((result) => ({
        value: result.tsExternalId,
        label: result.name,
      }))
    );
  };

  return (
    <div>
      <h4>Time Series</h4>
      <AutoComplete
        mode="async"
        theme="dark"
        loadOptions={loadOptions}
        onChange={(nextValue: { value: string; label: string }) => {
          onUpdateNode({
            title: nextValue.label,
            functionData: {
              timeSeriesExternalId: nextValue.value || '',
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
  title: 'Time Series',
  subtitle: 'TIME SERIES',
  color: '#FC2574',
  icon: 'Function',
  inputPins: [],
  outputPins: [
    {
      id: 'result',
      title: 'Time Series',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: effectId,
  functionData: {
    timeSeriesExternalId: '',
  },
} as StorableNode;
