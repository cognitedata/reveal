import { CodeMessage } from './CodeMessage';
import { DataModelMessage } from './DataModelMessage';
import { DataQueryMessage } from './DataQueryMessage';
import { HumanApprovalMessage } from './HumanApprovalMessage';
import { TextMessage } from './TextMessage';

export const messageRenderers = {
  text: TextMessage,
  error: TextMessage,
  code: CodeMessage,
  'data-model-query': DataQueryMessage,
  'data-model': DataModelMessage,
  'data-models': DataModelMessage,
  'human-approval': HumanApprovalMessage,
};

export * from './MessageBase';
export * from './components/ResponsiveActions';
