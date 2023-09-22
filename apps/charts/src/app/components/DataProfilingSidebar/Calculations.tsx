/**
 * Data Profiling Calculations
 */

import { FunctionComponent, useState } from 'react';
import { Elements } from 'react-flow-renderer';

import {
  NodeDataDehydratedVariants,
  NodeTypes,
} from '@charts-app/components/NodeEditor/V2/types';
import { addWorkflow, removeSource } from '@charts-app/models/chart/updates';
import { getEntryColor } from '@charts-app/utils/colors';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { v4 as uuidv4 } from 'uuid';

import { Chart, ChartSource, ChartWorkflowV2 } from '@cognite/charts-lib';
import { Switch } from '@cognite/cogs.js';

type Props = {
  chart: Chart;
  source: ChartSource;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
};

interface DataProfilingWorkflowV2 extends ChartWorkflowV2 {
  dataProfiling: boolean;
  sourceId: string;
}

const defaultTranslations = makeDefaultTranslations('Show gaps');

const Calculations: FunctionComponent<Props> = ({
  chart,
  source,
  updateChart,
}: Props) => {
  const t = {
    ...defaultTranslations,
  };

  const dataProfilingWorkflow = chart.workflowCollection?.find(
    (flow) =>
      (flow as DataProfilingWorkflowV2)?.dataProfiling &&
      (flow as DataProfilingWorkflowV2)?.sourceId === source.id
  );
  const [showGaps, setShowGaps] = useState<boolean>(!!dataProfilingWorkflow);

  const onSwitchToggle = () => {
    if (showGaps) {
      if (dataProfilingWorkflow?.id) {
        updateChart((oldChart) =>
          removeSource(oldChart!, dataProfilingWorkflow?.id)
        );
      }
    } else {
      const newWorkflowId = uuidv4();
      const sourceNodeId = uuidv4();
      const functionNodeId = uuidv4();
      const outputNodeId = uuidv4();

      const elementsTemplate: Elements<NodeDataDehydratedVariants> = [
        {
          id: sourceNodeId,
          type: NodeTypes.SOURCE,
          position: { x: 100, y: 150 },
          data: {
            selectedSourceId: source.id,
            type: source.type,
          },
        },
        {
          id: `reactflow__edge-${sourceNodeId}result-${functionNodeId}data`,
          source: sourceNodeId,
          sourceHandle: 'result',
          target: functionNodeId,
          targetHandle: 'data',
        },
        {
          id: functionNodeId,
          type: NodeTypes.FUNCTION,
          position: { x: 450, y: 150 },
          data: {
            parameterValues: {},
            selectedOperation: {
              op: 'gaps_identification_iqr',
              version: '1.0',
            },
          },
        },
        {
          id: `reactflow__edge-${functionNodeId}out-result-0-${outputNodeId}datapoints`,
          source: functionNodeId,
          sourceHandle: 'out-result-0',
          target: outputNodeId,
          targetHandle: 'datapoints',
        },
        {
          id: outputNodeId,
          type: NodeTypes.OUTPUT,
          position: { x: 700, y: 150 },
        },
      ];

      const newWorkflow: DataProfilingWorkflowV2 = {
        version: 'v2',
        id: newWorkflowId,
        dataProfiling: true,
        sourceId: source.id,
        name: 'New Calculation',
        color: getEntryColor(chart.id, newWorkflowId),
        flow: {
          elements: elementsTemplate,
          position: [0, 0],
          zoom: 1,
        },
        lineWeight: 1,
        lineStyle: 'solid',
        enabled: true,
        createdAt: Date.now(),
        unit: '',
        preferredUnit: '',
        settings: { autoAlign: true },
      };

      updateChart((oldChart) => addWorkflow(oldChart!, newWorkflow));
    }

    return setShowGaps((prev) => !prev);
  };

  return (
    <Switch
      name="show-gaps"
      label={t['Show gaps']}
      checked={showGaps}
      onChange={() => onSwitchToggle()}
    />
  );
};

export default Calculations;
