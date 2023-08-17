import { AFlow, ProcessNodeData, ProcessType } from '@flows/types';
import {
  TaskDefinition,
  WorkflowDefinitionResponse,
  WorkflowWithVersions,
} from '@flows/types/workflows';

const ALLOWED_PROCESS_TYPES: ProcessType[] = ['transformation', 'function'];

export const getLastWorkflowDefinition = (
  workflowWithVersions?: WorkflowWithVersions
): { workflowDefinition?: WorkflowDefinitionResponse; version?: string } => {
  if (!workflowWithVersions)
    return {
      workflowDefinition: undefined,
      version: undefined,
    };

  const versions = Object.keys(workflowWithVersions.versions);
  if (versions.length === 0) {
    return {
      workflowDefinition: undefined,
      version: undefined,
    };
  }

  const lastVersion = versions[versions.length - 1];

  return {
    workflowDefinition: workflowWithVersions.versions[lastVersion],
    version: lastVersion,
  };
};

export const convertCanvasToWorkflowDefinition = (
  flow: AFlow
): TaskDefinition[] => {
  const tasks: TaskDefinition[] = [];

  flow.canvas.nodes
    .filter(
      (n) =>
        ALLOWED_PROCESS_TYPES.includes(
          (n.data as ProcessNodeData).processType
        ) && !!(n.data as ProcessNodeData).processExternalId
    )
    .forEach((n) => {
      const task: TaskDefinition = {
        dependsOn: [],
        externalId: (n.data as ProcessNodeData).processExternalId!,
        parameters: {
          [(n.data as ProcessNodeData).processType]: {
            externalId: (n.data as ProcessNodeData).processExternalId!,
          },
        } as any, // TODO: fix type
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
      targetTask.dependsOn?.push({
        externalId: sourceTask.externalId,
      });
    }
  });

  return tasks;
};

export const areWorkflowTaskDefinitionsSame = (
  d1: TaskDefinition,
  d2: TaskDefinition
): boolean => {
  return d1.externalId === d2.externalId && d1.type === d2.type;
};

export const areWorkflowDefinitionsSame = (
  tasks1: WorkflowDefinitionResponse['tasks'],
  tasks2: WorkflowDefinitionResponse['tasks']
): boolean => {
  return (
    tasks1.length === tasks2.length &&
    tasks1.every((d1t) =>
      tasks2.some((d2t) => areWorkflowTaskDefinitionsSame(d1t, d2t))
    )
  );
};

export const isCanvasEmpty = (flow: AFlow) => {
  const noNodes = flow.canvas.nodes.length === 0;
  const noEdges = flow.canvas.edges.length === 0;

  return noNodes && noEdges;
};
