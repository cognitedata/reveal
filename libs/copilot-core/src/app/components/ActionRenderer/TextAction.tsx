import { useState, useEffect, useRef } from 'react';

import styled from 'styled-components';

import { useBotUI, useBotUIAction } from '@botui/react';

import { Button, Flex, Textarea } from '@cognite/cogs.js';
import {
  getActions,
  CopilotAction,
  CopilotMessage,
  CopilotSupportedFeatureType,
} from '@cognite/llm-hub';
import { useSDK } from '@cognite/sdk-provider';

import { ResponsiveActions } from '../MessageRenderer/components/ResponsiveActions';

export const TextAction = ({ disabled }: { disabled?: boolean }) => {
  const textActionProps = useBotUIAction();

  const {
    meta: { feature, waiting },
  } = textActionProps!;

  const bot = useBotUI(); // current instance
  const sdk = useSDK();

  const [value, setValue] = useState('');
  const [actions, setActions] = useState<CopilotAction[]>([]);

  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  useEffect(() => {
    bot.message.getAll().then(async (messages) => {
      const newActions = await getActions(
        feature as CopilotSupportedFeatureType,
        sdk,
        messages.map(
          (el) =>
            ({
              ...(el.data as CopilotMessage),
              source: el.meta.previous ? 'user' : 'bot',
            } as CopilotMessage)
        ),
        async (message) => {
          await bot.next(message);
        }
      );
      setActions(newActions);
    });
  }, [sdk, bot, feature]);

  const handleInputChange = () => {
    const textarea = ref.current;
    if (textarea) {
      // Calculate the number of rows (lines) in the textarea based on the content
      const rows = textarea?.value.split('\n').length || 1;

      // Set a maximum of 7 lines (you can adjust this number as needed)
      const maxRows = 7;

      // Calculate the maximum height based on the number of rows
      const maxHeight = `${Math.min(rows, maxRows) * 1.5}em`; // Adjust the line height as needed

      // Set the maximum height to the textarea
      textarea.style.height = maxHeight;
    }
  };

  return (
    <Wrapper
      gap={8}
      direction="column"
      style={{ position: 'relative', width: '100%' }}
    >
      {!waiting && !disabled && actions?.length > 0 && (
        <ResponsiveActions actions={actions} />
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <Textarea
          ref={ref}
          value={value}
          disabled={!!waiting || disabled}
          onChange={(e) => {
            handleInputChange();
            setValue(e.target.value);
          }}
          placeholder="Ask CogPilot anything..."
          rows={1}
          style={{
            width: '100%',
            padding: 0,
            margin: 0,
          }}
          onKeyDown={(e) => {
            if (!e.shiftKey && e.keyCode === 13 && !!value) {
              bot.next({ content: value, type: 'text' });
            }
          }}
        />

        <Button
          className="send-button"
          icon="Send"
          disabled={!!waiting}
          onClick={() => {
            if (value) {
              bot.next({ content: value });
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

  .cogs.cogs-textarea {
    width: 100%;
    padding: 16px;
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
`;
