import { AutoComplete } from '@cognite/cogs.js';
import {
  Chart,
  ChartWorkflow,
  ConfigPanelComponentProps,
  StorableNode,
} from 'reducers/charts/types';
import { useRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';

export const effectId = 'OUTPUT';

export const ConfigPanel = ({ context }: ConfigPanelComponentProps) => {
  const { chart, workflow } = context;

  const [, setChart] = useRecoilState(chartState);

  const workspaceTimeSeries = (chart as Chart).timeSeriesCollection || [];
  const workspaceWorkflows = (chart as Chart).workflowCollection || [];

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
    sourceList.find(({ value }) => value === workflow?.attachTo)?.label ||
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
          setChart((oldChart) => ({
            ...oldChart!,
            workflowCollection: oldChart!.workflowCollection?.map(
              (wf: ChartWorkflow) =>
                wf.id === workflow.id
                  ? {
                      ...wf,
                      attachTo: nextValue.value,
                    }
                  : wf
            ),
          }));
        }}
        value={{
          value: workflow.attachTo,
          label: selectedWorkspaceTimeSeriesLabel,
        }}
      />
    </div>
  );
};

export const node = {
  title: 'Output',
  subtitle: 'CHART OUTPUT',
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
} as StorableNode;
