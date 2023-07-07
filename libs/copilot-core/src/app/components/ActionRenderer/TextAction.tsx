import { useState, useEffect, useRef } from 'react';

import styled from 'styled-components';

import { useBotUI, useBotUIAction } from '@botui/react';

import { Button, Flex, Textarea } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { getActions } from '../../../lib/getActions';
import {
  CopilotAction,
  CopilotMessage,
  CopilotSupportedFeatureType,
} from '../../../lib/types';
import { ResponsiveActions } from '../MessageRenderer/components/ResponsiveActions';

export const TextAction = () => {
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

  return (
    <Wrapper
      gap={8}
      direction="column"
      style={{ position: 'relative', width: '100%' }}
    >
      {actions?.length > 0 && (
        <Flex gap={4}>
          <ResponsiveActions actions={actions} />
        </Flex>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <Textarea
          ref={ref}
          value={value}
          disabled={!!waiting}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask CogPilot anything..."
          style={{
            height: 56,
            padding: 16,
            width: '100%',
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
              bot.next({ content: value, type: 'text' });
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

  .cogs-textarea {
    width: 100%;
    textarea {
      color: black !important;
    }
  }
`;
