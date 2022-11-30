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
  // TODO(POWEROPS-813): Need to ignore that the WorkflowSchemaWithProcesses does not have the enabled field as a type. To update to the latest api types failed
  // @ts-expect-error Need to improve here
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, cdfProject, enabled, ...editableWs } = ws;
  return editableWs;
};
