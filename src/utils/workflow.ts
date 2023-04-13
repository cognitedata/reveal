import { IconType } from '@cognite/cogs.js';
import { WorkflowComponentType } from 'types/workflow';

export const WORKFLOW_COMPONENT_TYPES = [
  'transformation',
  'webhook',
  'workflow',
] as const;

export const WORKFLOW_COMPONENT_ICON_TYPES: Record<
  WorkflowComponentType,
  IconType
> = {
  transformation: 'Code',
  webhook: 'FrameTool',
  workflow: 'Pipeline',
};
