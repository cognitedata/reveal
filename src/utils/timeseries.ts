import { node as TimeSeriesReferenceNode } from 'components/NodeEditor/V1/Nodes/TimeSeriesReference';
import { node as OutputSeriesNode } from 'components/NodeEditor/V1/Nodes/OutputSeries';
import {
  ChartTimeSeries,
  ChartWorkflow,
  ChartWorkflowV1,
} from 'models/chart/types';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';
import { getEntryColor } from './colors';

export function getGranularityInMS(granularity: string): number {
  return ms(granularity);
}

export const calculateGranularity = (
  domain: number[],
  pointsPerSeries: number
) => {
  const timeDifference = domain[1] - domain[0];
  // Seconds
  for (let i = 1; i <= 60; i++) {
    const pointsPerSecond = timeDifference / (1000 * i);
    if (pointsPerSecond < pointsPerSeries) {
      return `${i}s`;
    }
  }
  // Minutes
  for (let i = 1; i <= 60; i++) {
    const pointsPerMinute = timeDifference / (1000 * 60 * i);
    if (pointsPerMinute < pointsPerSeries) {
      return `${i}m`;
    }
  }
  // Hours
  for (let i = 1; i < 24; i++) {
    const pointsPerHour = timeDifference / (1000 * 60 * 60 * i);
    if (pointsPerHour < pointsPerSeries) {
      return `${i}h`;
    }
  }
  // Days
  for (let i = 1; i < 100; i++) {
    const pointsPerDay = timeDifference / (1000 * 60 * 60 * 24 * i);
    if (pointsPerDay < pointsPerSeries) {
      return `${i}d`;
    }
  }
  return '1d';
};

export const convertTsToWorkFlow = (
  chartId: string,
  ts: ChartTimeSeries
): ChartWorkflow => {
  const workflowId = uuidv4();
  const inputNodeId = `${TimeSeriesReferenceNode.subtitle}-${uuidv4()}`;
  const outputNodeId = `${OutputSeriesNode.subtitle}-${uuidv4()}`;
  const connectionId = uuidv4();

  /**
   * TODO: This needs to be updated when React Flow has been implemented.
   * Version needs to be set to 'v2' with the corresponding format of ChartWorkflowV2
   */
  const workflow: ChartWorkflowV1 = {
    version: '',
    id: workflowId,
    name: `${ts.name} (workflow)`,
    nodes: [
      {
        id: inputNodeId,
        ...TimeSeriesReferenceNode,
        title: ts.name,
        subtitle: `DATAPOINTS (${ts.id})`,
        functionData: {
          timeSeriesExternalId: ts.tsExternalId,
        },
        x: 50,
        y: 50,
      },
      {
        id: outputNodeId,
        ...OutputSeriesNode,
        x: 800,
        y: 70,
      },
    ],
    connections: {
      [connectionId]: {
        id: connectionId,
        inputPin: {
          nodeId: outputNodeId,
          pinId: OutputSeriesNode.inputPins[0].id,
        },
        outputPin: {
          nodeId: inputNodeId,
          pinId: TimeSeriesReferenceNode.outputPins[0].id,
        },
      },
    },
    color: getEntryColor(chartId, workflowId),
    lineWeight: 1,
    lineStyle: 'solid',
    displayMode: 'lines',
    enabled: true,
  };

  return workflow;
};
