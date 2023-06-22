import { CodeMessage } from './CodeMessage';
import { TextMessage } from './TextMessage';

export const messageRenderers = {
  text: TextMessage,
  code: CodeMessage,
};
