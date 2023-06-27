import { CodeMessage } from './CodeMessage';
import { DataModelMessage } from './DataModelMessage';
import { HumanApprovalMessage } from './HumanApprovalMessage';
import { TextMessage } from './TextMessage';

export const messageRenderers = {
  text: TextMessage,
  code: CodeMessage,
  'data-model': DataModelMessage,
  'human-approval': HumanApprovalMessage,
};
