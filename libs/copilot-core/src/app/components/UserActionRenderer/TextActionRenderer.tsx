import { useState, useEffect, useRef, useCallback } from 'react';

import styled from 'styled-components';

import { useBotUI, useBotUIAction } from '@botui/react';

import { Button, Flex, Textarea } from '@cognite/cogs.js';

import { CopilotTextResponse, TextAction } from '../../../lib/types';

export const TextActionRenderer = ({ disabled }: { disabled?: boolean }) => {
  const textActionProps = useBotUIAction();

  const {
    meta: { waiting, action },
  } = textActionProps!;

  const bot = useBotUI(); // current instance

  const [value, setValue] = useState('');

  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  const resizeTextArea = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [ref]);

  useEffect(() => resizeTextArea(), [resizeTextArea, value]);

  return (
    <Wrapper
      gap={8}
      direction="column"
      style={{ position: 'relative', width: '100%' }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <Textarea
          ref={ref}
          value={value}
          disabled={!!waiting || disabled}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          placeholder={
            (action as TextAction).text || 'Ask CogPilot anything...'
          }
          rows={1}
          style={{
            width: '100%',
            padding: 0,
            margin: 0,
          }}
          onKeyDown={(e) => {
            if (!e.shiftKey && e.key === 'Enter' && !!value) {
              bot.next({
                content: value,
                source: 'user',
                type: 'text',
              } as CopilotTextResponse);
            }
          }}
        />

        <Button
          className="send-button"
          icon="Send"
          disabled={!!waiting}
          onClick={() => {
            if (value) {
              bot.next({
                content: value,
                source: 'user',
                type: 'text',
              } as CopilotTextResponse);
            }
          }}
          type="ghost"
          size="small"
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;

  .send-button {
    position: absolute;
    right: 16px;
    top: 14px;
    color: rgba(83, 88, 127, 0.8);
  }
  .cogs-textarea--disabled {
    background-color: var(--cogs-surface--interactive--disabled);
    border-color: var(--cogs-surface--misc-transparent);
    resize: none;
    cursor: not-allowed;

    textarea {
      background-color: transparent !important;
    }
  }

  .cogs-textarea {
    width: 100%;
    padding: 16px;
    padding-bottom: 14px;
    border: 2px solid var(--cogs-border--interactive--default);
    border-radius: var(--cogs-border-radius--default);
    outline: none;
    resize: none;
    textarea {
      border-radius: 0;
      border: none;
      color: black !important;
      padding-right: 28px;
    }
  }
  .cogs-textarea-container {
    display: flex;
  }
`;
