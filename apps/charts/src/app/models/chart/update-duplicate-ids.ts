import { Edge, FlowElement, Node } from 'react-flow-renderer';

import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { trackUsage } from '../../services/metrics';

import { Chart, ChartWorkflow } from './types';

const isEdge = (element: FlowElement): element is Edge => {
  return 'source' in element && 'target' in element;
};

const isNode = (element: FlowElement): element is Node => {
  return 'type' in element;
};

export const updateDuplicateIds = (chart: Chart): Chart => {
  const newIdByOldId = new Map<string, string>();

  if (!chart?.workflowCollection?.length) {
    return chart;
  }

  // Cloning the char because FlowElements are frozen and cannot be modified.
  const cloneChart = cloneDeep(chart);
  const { workflowCollection = [] } = cloneChart;

  workflowCollection.forEach((calculation: ChartWorkflow) => {
    if (calculation.version === 'v2' && calculation.flow) {
      // First loop to ensure all IDs are unique and fix duplicates

      calculation.flow.elements.forEach((element: FlowElement) => {
        // If the element id does not already exist in the newIdByOldId map,
        // set the element's id to itself in the map and stop further execution.
        if (!newIdByOldId.has(element.id)) {
          newIdByOldId.set(element.id, element.id);
          return;
        }

        if (isNode(element)) {
          const newId = uuidv4();
          newIdByOldId.set(element.id, newId);
          element.id = newId;
        }
      });

      // Once IDs are managed, second loop to fix the source, target, and handle properties.
      // Update the source, target, and handle properties if they are in the idMap.
      calculation.flow.elements.forEach((element: FlowElement) => {
        if (isEdge(element)) {
          element.source = newIdByOldId.get(element.source) as string;
          element.target = newIdByOldId.get(element.target) as string;
        }

        // If this is an edge and its ID includes an old ID, replace it with the new ID.
        if (isEdge(element) && element.id.includes('reactflow__edge')) {
          Array.from(newIdByOldId.entries()).forEach(([oldId, newId]) => {
            if (element.id.includes(oldId)) {
              element.id = element.id.replace(oldId, newId);
            }
          });
        }

        if (
          element.data &&
          element.data.handle &&
          newIdByOldId.has(element.data.handle)
        ) {
          element.data.handle = newIdByOldId.get(element.data.handle) as string;
        }
      });
    }
  });

  trackUsage('ChartView.CalculationIdMigrationSuccess', {
    remarks: `${workflowCollection.length} calculations id migrated`,
    chart: cloneChart.id,
    noOfCalcs: workflowCollection.length,
  });

  return cloneChart;
};
