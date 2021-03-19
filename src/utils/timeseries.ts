import { node as TimeSeriesReferenceNode } from 'reducers/charts/Nodes/TimeSeriesReference';
import { node as OutputSeriesNode } from 'reducers/charts//Nodes/OutputSeries';
import { ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import { nanoid } from 'nanoid';
import { getEntryColor } from './colors';

export const calculateGranularity = (domain: number[], pps: number) => {
  const diff = domain[1] - domain[0];
  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}s`;
    }
  }
  for (let i = 1; i <= 60; i += 1) {
    const points = diff / (1000 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}m`;
    }
  }
  for (let i = 1; i < 24; i += 1) {
    const points = diff / (1000 * 60 * 60 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}h`;
    }
  }
  for (let i = 1; i < 100; i += 1) {
    const points = diff / (1000 * 60 * 60 * 24 * i);
    if (points < pps) {
      return `${i === 1 ? '' : i}day`;
    }
  }
  return 'day';
};

export const convertTsToWorkFlow = (ts: ChartTimeSeries): ChartWorkflow => {
  const workflowId = nanoid();
  const inputNodeId = `${TimeSeriesReferenceNode.subtitle}-${nanoid()}`;
  const outputNodeId = `${OutputSeriesNode.subtitle}-${nanoid()}`;
  const connectionId = nanoid();

  const workflow: ChartWorkflow = {
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
    color: getEntryColor(),
    lineWeight: 2,
    lineStyle: 'solid',
    enabled: true,
  };

  return workflow;
};
