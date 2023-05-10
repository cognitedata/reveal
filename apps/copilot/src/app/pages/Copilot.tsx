import React, { useState, useEffect, useCallback } from 'react';

import { BotuiInterface, createBot } from 'botui';
import {
  BotUI,
  BotUIMessageList,
  BotUIAction,
  useBotUI,
  // useBotUIAction,
} from '@botui/react';
import { Body, Button, Flex, Icon, Textarea, Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

const TextAction = () => {
  const bot = useBotUI(); // current instance

  const [value, setValue] = useState('');

  return (
    <Flex gap={4}>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ height: 100, flex: 1, color: 'black' }}
        onKeyDown={(e) => {
          if (!e.shiftKey && e.keyCode === 13) {
            bot.next({ text: value });
          }
        }}
      />
      <Button onClick={() => bot.next({ text: value })}>Send</Button>
    </Flex>
  );
};

const TextMessage = ({ message }: { message: any }) => {
  return <Body>{message.data.text}</Body>;
};
const actionRenderers = {
  text: TextAction,
};
const messageRenderer = {
  text: TextMessage,
};

export const Copilot = () => {
  const [bot, setBot] = useState<BotuiInterface | undefined>();
  const [mostRecentMessage, setMostRecentMessage] = useState<
    string | undefined
  >();

  const reset = () => {
    setBot(undefined);
    setTimeout(() => {
      const myBot = createBot();
      myBot
        .wait({ waitTime: 100 })
        .then(() =>
          myBot.message.add(
            {
              text: 'Welcome to Cognite Copilot, what would you know to know about?',
            },
            { messageType: 'text' }
          )
        )
        .then(() => myBot.action.set({}, { actionType: 'text' }))
        .then(({ text }: { text: string }) => setMostRecentMessage(text));

      setBot(myBot);
    }, 100);
  };

  useEffect(() => {
    reset();
  }, []);

  const showResultAndPrompt = useCallback(
    (result: string) => {
      if (bot) {
        bot.message
          .add({ text: result }, { messageType: 'text' })
          .then(() => bot.action.set({}, { actionType: 'text' }))
          .then(({ text }: { text: string }) => setMostRecentMessage(text));
      }
    },
    [bot]
  );

  useEffect(() => {
    if (mostRecentMessage) {
      // loading logic for chat gpt, and then pass response here below
      showResultAndPrompt(`what u sent:${mostRecentMessage}`);
    }
  }, [mostRecentMessage, showResultAndPrompt]);

  return (
    <Wrapper>
      <Flex
        className="header"
        gap={6}
        alignItems="center"
        style={{
          borderBottom: '1px solid lightgray',
          paddingBottom: 8,
        }}
      >
        <Icon type="Cognite" />
        <Title level={3} style={{ flex: 1 }}>
          Cognite CoPilot
        </Title>
        <Button icon="Refresh" onClick={() => reset()}>
          Reset
        </Button>
      </Flex>

      {bot ? (
        <BotUI bot={bot}>
          <Flex
            direction="column-reverse"
            style={{ overflow: 'auto', marginBottom: 8 }}
          >
            <BotUIMessageList renderer={messageRenderer} />
          </Flex>
          <BotUIAction renderer={actionRenderers} />
        </BotUI>
      ) : (
        <Icon type="Loader" />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: var(--cdf-ui-navigation-height);
  right: 20px;
  background: rgba(250, 256, 256, 0.95);
  padding: 24px;
  width: 400px;
  max-height: 640px;
  border-radius: 12px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;

  .header .cogs-icon--type-cognite {
    width: 32px;
    color: black;
  }
  .botui_message_content {
    overflow: auto;
  }
  .botui_app_container {
    width: 100%;
    overflow: hidden;
    flex: 1;
    position: relative;
    display: flex;
  }
  .botui_container {
    height: auto;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .botui_message_list {
    padding: 0;
    width: 100%;
    > div {
      /* height: 100%;
      overflow: auto; */
    }
  }
  .botui_action_container {
    padding: 0;
    .botui_action {
      padding: 0;
    }
  }
  .cogs-textarea {
    flex: 1;
    height: 100px;
  }
`;
