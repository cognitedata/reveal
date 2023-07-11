import React from 'react';

import { Renderer } from '@botui/react/dist/types';

import { CodeMessage } from './CodeMessage';
import { DataModelMessage } from './DataModelMessage';
import { HumanApprovalMessage } from './HumanApprovalMessage';
import { MessageBase } from './MessageBase';
import { TextMessage } from './TextMessage';

const renderers = {
  text: TextMessage,
  code: CodeMessage,
  'data-model-query': TextMessage,
  'data-model': DataModelMessage,
  'human-approval': HumanApprovalMessage,
};

export const messageRenderers = Object.entries(renderers).reduce(
  (prev, [key, Value]) => {
    return {
      ...prev,
      [key]: (props) => (
        <MessageBase {...props}>
          <Value {...props} />
        </MessageBase>
      ),
    };
  },
  {} as Renderer
);
