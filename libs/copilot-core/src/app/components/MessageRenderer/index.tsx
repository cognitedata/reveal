import { CodeMessage } from './CodeMessage';
import { DataModelMessage } from './DataModelMessage';
import { DataQueryMessage } from './DataQueryMessage';
import { TextMessage } from './TextMessage';

export const messageRenderers = {
  text: TextMessage,
  error: TextMessage,
  code: CodeMessage,
  'data-model-query': DataQueryMessage,
  'data-models': DataModelMessage,
};

export * from './MessageBase';
export * from './components/ResponsiveActions';
