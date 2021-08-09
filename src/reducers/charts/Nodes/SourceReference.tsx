import { AutoComplete } from '@cognite/cogs.js';
import { Chart, StorableNode } from 'reducers/charts/types';
import { ConfigPanelComponentProps } from '../types';

type FunctionData = {
  type: string;
  sourceId: string;
  context: {
    chart: Chart;
  };
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.sourceId) {
    throw new Error('No id given in config');
  }

  return {
    result: {
      type: funcData.type,
      sourceId: funcData.type,
    },
  };
};

export const effectId = 'SOURCE_REFERENCE';

export const ConfigPanel = ({
  node,
  onUpdateNode,
  context,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  const { workflow } = context;

  const workspaceTimeSeries =
    (context.chart as Chart).timeSeriesCollection || [];

  const workspaceWorkflows = (context.chart as Chart).workflowCollection || [];

  const sourceList = [
    ...workspaceTimeSeries.map((ts) => ({
      type: 'timeseries',
      id: ts.tsExternalId,
      name: ts.name,
    })),
    ...workspaceWorkflows.map((wf) => ({
      type: 'workflow',
      id: wf.id,
      name: wf.name,
    })),
  ];

  const selectedWorkspaceTimeSeriesLabel =
    sourceList.find(({ id }) => id === functionData.sourceId)?.name || '';

  const loadOptions = (
    _: string,
    callback: (options: { value?: string; label?: string }[]) => void
  ) => {
    callback(
      sourceList
        .filter((source) => source.id !== workflow.id)
        .map((source) => ({
          value: source.id,
          label: source.name,
        }))
    );
  };

  const typeDisplayNames = [
    { id: 'timeseries', label: 'Time Series' },
    { id: 'workflow', label: 'Calculation' },
  ];

  return (
    <div>
      <h4>Source</h4>
      <AutoComplete
        mode="async"
        theme="dark"
        loadOptions={loadOptions}
        onChange={(nextValue: { value: string; label: string }) => {
          const { type } =
            sourceList.find(({ id }) => id === nextValue.value) || {};

          const subtitle = typeDisplayNames.find(({ id }) => id === type)
            ?.label;

          onUpdateNode({
            title: nextValue.label,
            subtitle: subtitle || 'Source',
            functionData: {
              type,
              sourceId: nextValue.value || '',
            },
          });
        }}
        value={{
          value: functionData.sourceId,
          label: selectedWorkspaceTimeSeriesLabel,
        }}
      />
    </div>
  );
};

export const node = {
  title: 'Input',
  subtitle: 'Source',
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
    type: '',
    sourceId: '',
  },
} as StorableNode;
