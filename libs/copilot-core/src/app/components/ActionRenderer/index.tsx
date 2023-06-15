import { useState, useEffect, useRef } from 'react';

import { useBotUI, useBotUIAction } from '@botui/react';

import { Button, Flex, Textarea } from '@cognite/cogs.js';

import { getActions } from '../../../lib/getActions';
import {
  CopilotAction,
  CopilotMessage,
  CopilotSupportedFeatureType,
} from '../../../lib/types';

const TextAction = () => {
  const textActionProps = useBotUIAction();

  const {
    meta: { feature },
  } = textActionProps!;

  const bot = useBotUI(); // current instance

  const [value, setValue] = useState('');
  const [actions, setActions] = useState<CopilotAction[]>();

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
  }, [bot, feature]);

  return (
    <Flex gap={4} direction="column">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask CogPilot anything..."
        style={{
          height: 100,
          width: '100%',
          margin: 0,
        }}
        onKeyDown={(e) => {
          if (!e.shiftKey && e.keyCode === 13) {
            bot.next({ content: value, type: 'text' });
          }
        }}
      />
      <Flex gap={4}>
        {actions?.map((action) => (
          <Button onClick={action.onClick} size="small" key={action.content}>
            {action.content}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
};

const WaitComponent = () => (
  <Flex style={{ position: 'relative', width: '100%' }}>
    <Textarea
      placeholder="Ask CogPilot anything..."
      style={{
        height: 100,
        width: '100%',
        margin: 0,
      }}
      disabled
    />
    <Flex>
      <Button style={{ opacity: 0 }} disabled size="small" />
    </Flex>
  </Flex>
);

export const actionRenderers = {
  text: TextAction,
  wait: WaitComponent,
};
