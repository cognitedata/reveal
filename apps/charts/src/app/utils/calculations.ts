/**
 * Helper methods for Chart Calculations
 */
import { FlowElement } from 'react-flow-renderer';

import { v4 as uuidv4 } from 'uuid';

import { ChartWorkflow, ChartWorkflowV2 } from '@cognite/charts-lib';

type IdMapType = Record<string, string>;

export function calcDeepCloneAndReplaceNodeElementsId(
  calculation: ChartWorkflowV2 | ChartWorkflow
) {
  // Deep clone
  const clonedCalculation: ChartWorkflowV2 = JSON.parse(
    JSON.stringify(calculation)
  );

  // Map to hold old-to-new ID mappings
  const idMap: IdMapType = {};

  // Recursive function to replace old IDs in object
  const replaceIdsInObject = (obj: any) => {
    // check if obj is an object
    if (!obj || typeof obj !== 'object') return;

    Object.entries(obj).forEach(([key, value]) => {
      if (!!value && typeof value === 'object') {
        replaceIdsInObject(value);
      }

      // If the property is a string and matches an old ID, replace it
      if (typeof value === 'string' && idMap[value]) {
        obj[key] = idMap[value];
      }

      // TODO(DEGR-0000): This function also needs to replace old id ref within the ID of source elements]
      // aka "reactflow__edge-a9be893f-757c-4538-af37-3c65f3eec678null-26ee0d01-725a-4125-a1b8-9da1f095cadea" should be
      // "reactflow__edge-0c09f762-5395-4586-8de2-d14d445c41f68null-614ae88c-b656-4ef2-b67f-64c53cebbbdb" should be
      // wehre 0c0xxx is source and 614xx is target
    });
  };

  if (clonedCalculation.flow) {
    // Replace element IDs and populate idMap
    clonedCalculation.flow.elements.forEach((element: FlowElement) => {
      if (element.id && element.type) {
        const oldId = element.id;
        const newId = uuidv4();
        element.id = newId;
        idMap[oldId] = newId;
      }
    });
  }

  // Replace all occurrences of old IDs
  replaceIdsInObject(clonedCalculation);

  return clonedCalculation;
}
