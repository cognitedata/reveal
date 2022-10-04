import {
  WorkflowSchemaWithProcesses,
  WorkflowSchemaWithProcessesUpdate,
} from '@cognite/power-ops-api-types';
import { WorkflowSchemaEditable } from 'types';

export const convertEditableToWorkflowSchemaUpdate = (
  edited: WorkflowSchemaEditable,
  current: WorkflowSchemaWithProcesses
): WorkflowSchemaWithProcessesUpdate => ({
  ...edited,
  id: current.id,
  cdfProject: current.cdfProject,
});

export const convertWorkflowSchemaToEditable = (
  ws: WorkflowSchemaWithProcesses
): WorkflowSchemaEditable => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, cdfProject, ...editableWs } = ws;
  return editableWs;
};
