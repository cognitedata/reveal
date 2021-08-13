import { AutoComplete } from '@cognite/cogs.js';
import {
  Chart,
  ChartWorkflow,
  ConfigPanelComponentProps,
  StorableNode,
} from 'reducers/charts/types';
import { useUpdateChart } from 'hooks/firebase';

export const effectId = 'OUTPUT';

export const ConfigPanel = ({
  node,
  onUpdateNode,
  context,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  const { chart, workflow } = context;

  const { mutate: updateChart } = useUpdateChart();

  const workspaceTimeSeries =
    (context.chart as Chart).timeSeriesCollection || [];

  const workspaceWorkflows = (context.chart as Chart).workflowCollection || [];

  const sourceList = [
    { value: '', label: 'None' },
    ...workspaceTimeSeries
      .filter((ts) => ts.enabled)
      .map((ts) => ({
        value: ts.id,
        label: ts.name,
      })),
    ...workspaceWorkflows
      .filter((wf) => wf.enabled && !wf.attachTo && wf.id !== workflow.id)
      .map((wf) => ({
        value: wf.id,
        label: wf.name,
      })),
  ];

  const selectedWorkspaceTimeSeriesLabel =
    sourceList.find(({ value }) => value === functionData?.attachTo)?.label ||
    'None';

  const loadOptions = (
    _: string,
    callback: (options: { value?: string; label?: string }[]) => void
  ) => {
    callback(sourceList);
  };

  return (
    <div>
      <h4>Merge y-axis to</h4>
      <AutoComplete
        mode="async"
        theme="dark"
        loadOptions={loadOptions}
        onChange={(nextValue: { value: string; label: string }) => {
          // Update workflow
          updateChart({
            ...chart,
            workflowCollection: chart.workflowCollection?.map(
              (wf: ChartWorkflow) =>
                wf.id === workflow.id
                  ? {
                      ...wf,
                      attachTo: nextValue.value,
                    }
                  : wf
            ),
          });

          onUpdateNode({
            functionData: {
              attachTo: nextValue.value || '',
            },
          });
        }}
        value={{
          value: functionData.attachTo,
          label: selectedWorkspaceTimeSeriesLabel,
        }}
      />
    </div>
  );
};

export const node = {
  title: 'Output',
  subtitle: 'TIMESERIES',
  color: '#4A67FB',
  icon: 'Icon',
  outputPins: [],
  inputPins: [
    {
      id: 'datapoints',
      title: 'Time Series',
      types: ['TIMESERIES'],
    },
  ],
  functionEffectReference: effectId,
  functionData: {
    attachTo: '',
  },
} as StorableNode;
