import {
  WorkflowDefinitionRead,
  WorkflowTaskDefinition,
  WorkflowWithVersions,
} from 'hooks/workflows';
import { isEqual } from 'lodash';
import { AFlow, ProcessNodeData, ProcessType } from 'types';

const ALLOWED_PROCESS_TYPES: ProcessType[] = ['transformation', 'function'];

export const getLastWorkflowDefinition = (
  workflowWithVersions: WorkflowWithVersions
): WorkflowDefinitionRead | undefined => {
  const versions = Object.keys(workflowWithVersions.versions);
  if (versions.length === 0) {
    return undefined;
  }

  return workflowWithVersions.versions[versions[versions.length - 1]];
};

export const convertCanvasToWorkflowDefinition = (
  flow: AFlow
): WorkflowTaskDefinition[] => {
  const tasks: WorkflowTaskDefinition[] = [];

  flow.canvas.nodes
    .filter(
      (n) =>
        ALLOWED_PROCESS_TYPES.includes(
          (n.data as ProcessNodeData).processType
        ) && !!(n.data as ProcessNodeData).processExternalId
    )
    .forEach((n) => {
      const task: WorkflowTaskDefinition = {
        dependsOn: [],
        externalId: (n.data as ProcessNodeData).processExternalId!,
        name: n.id,
        type: (n.data as ProcessNodeData).processType,
      };
      tasks.push(task);
    });

  flow.canvas.edges.forEach(({ source, target }) => {
    const sourceNode = flow.canvas.nodes.find((n) => n.id === source);
    const targetNode = flow.canvas.nodes.find((n) => n.id === target);

    const sourceTask = tasks.find(({ name }) => name === source);
    const targetTask = tasks.find(({ name }) => name === target);

    if (sourceNode && sourceTask && targetNode && targetTask) {
      targetTask.dependsOn.push({
        externalId: sourceTask.externalId,
      });
    }
  });

  return tasks;
};

export const areWorkflowDefinitionsSame = (
  tasks1: WorkflowDefinitionRead['tasks'],
  tasks2: WorkflowDefinitionRead['tasks']
): boolean => {
  return (
    tasks1.length === tasks2.length &&
    tasks1.every((d1t) => tasks2.some((d2t) => isEqual(d1t, d2t)))
  );
};
