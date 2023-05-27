import React, { useState, useEffect, useCallback, useRef } from 'react';
import Highlight from 'react-highlight';

import {
  BotUI,
  BotUIMessageList,
  BotUIAction,
  useBotUI,
  useBotUIAction,
} from '@botui/react';
import { BotuiInterface, createBot } from 'botui';
import styled from 'styled-components/macro';

import { Body, Button, Flex, Icon, Modal, Textarea } from '@cognite/cogs.js';

import { getActions } from '../../lib/getActions';
import { processMessage } from '../../lib/processMessage';
import {
  CopilotAction,
  CopilotBotMessage,
  CopilotCodeMessage,
  CopilotMessage,
  CopilotTextMessage,
  CopilotSupportedFeatureType,
} from '../../lib/types';
import zIndex from '../utils/zIndex';

import { Editor } from './Editor/Editor';

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
const actionRenderers = {
  text: TextAction,
  wait: WaitComponent,
};

const TextMessage = ({
  message: {
    data: { content },
  },
}: {
  message: { data: CopilotTextMessage };
}) => {
  return <Body level={2}>{content}</Body>;
};
const CodeMessage = ({
  message: {
    data: { content, language, actions, prevContent },
  },
}: {
  message: { data: CopilotCodeMessage };
}) => {
  const [open, setOpen] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  return (
    <>
      <Flex direction="column" gap={4}>
        <Body level={2}>Click to view the follow code in full screen</Body>
        <Flex
          style={{
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            maxHeight: 200,
          }}
          onClick={() => setOpen(true)}
        >
          <Flex
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            justifyContent="center"
            alignItems="center"
          >
            <Icon type="Expand" />
          </Flex>
          <Highlight className={language}>{content}</Highlight>
        </Flex>
        {actions && (
          <Flex gap={4}>
            {actions.map((el) => (
              <Button onClick={el.onClick} key={el.content}>
                {el.content}
              </Button>
            ))}
          </Flex>
        )}
      </Flex>
      <Modal
        visible={open}
        title="Code preview"
        size="x-large"
        onCancel={() => setOpen(false)}
        hideFooter
        hidePaddings
      >
        <Flex direction="column" gap={16} style={{ padding: 16 }}>
          <Flex style={{ flex: 1 }}>
            <Editor
              language={language}
              code={content}
              prevCode={showDiff ? prevContent : undefined}
            />
          </Flex>
          <Flex gap={4}>
            {prevContent && (
              <Button onClick={() => setShowDiff(!showDiff)}>
                {showDiff ? 'Hide Diff' : 'Show Diff'}
              </Button>
            )}
            {actions?.map((el) => (
              <Button onClick={el.onClick} key={el.content}>
                {el.content}
              </Button>
            ))}
          </Flex>
        </Flex>
      </Modal>
    </>
  );
};

const messageRenderer = {
  text: TextMessage,
  code: CodeMessage,
};

export const ChatUI = ({
  onClose,
  feature,
}: {
  onClose: () => void;
  feature: CopilotSupportedFeatureType;
}) => {
  const messages = useRef<CopilotMessage[]>([]);
  const [bot, setBot] = useState<BotuiInterface | undefined>();

  const addMessageForBot = useCallback(
    async (chatBot: BotuiInterface, result: CopilotBotMessage) => {
      messages.current.push({ ...result, source: 'bot' });
      await chatBot.message.add(result, { messageType: result.type });
      // because linters think this is some special async func, but is actually just a wait function
      // eslint-disable-next-line testing-library/await-async-utils
      chatBot.wait();
    },
    []
  );

  useEffect(() => {
    setTimeout(() => {
      const newBot = createBot();
      newBot.wait({ waitTime: 100 }).then(() => {
        setBot(newBot);
      });
    }, 100);
  }, []);

  useEffect(() => {
    if (bot) {
      const promptUser = () => {
        bot.action
          .set({ feature }, { actionType: 'text', feature })
          .then(({ content }: { content: string }) => {
            messages.current.push({
              content: content,
              type: 'text',
              source: 'user',
            });
            processMessage(feature, content, messages.current, (message) =>
              addMessageForBot(bot, message)
            ).then((shouldPrompt) => {
              if (shouldPrompt) {
                promptUser();
              }
            });
            // because linters think this is some special async func, but is actually just a wait function
            // eslint-disable-next-line testing-library/await-async-utils
            bot.wait();
          });
      };
      processMessage(feature, '', messages.current, (message) =>
        addMessageForBot(bot, message)
      ).then((shouldPrompt) => {
        if (shouldPrompt) {
          promptUser();
        }
      });
    }
  }, [bot, feature, addMessageForBot]);

  return (
    <Wrapper>
      <Flex className="header" gap={6} alignItems="center">
        <div style={{ flex: 1 }} />
        <Button icon="Close" type="ghost" onClick={onClose} />
      </Flex>

      {bot ? (
        <BotUI bot={bot}>
          <Flex
            direction="column"
            style={{ overflow: 'auto', marginBottom: 8, flex: 1 }}
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
  z-index: ${zIndex.MAXIMUM};
  position: fixed;
  bottom: 70px;
  right: 10px;
  background: #fff;
  margin-top: 16px;
  padding: 16px;
  width: 320px;
  height: 400px;
  border-radius: 10px;
  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
  display: flex;
  flex-direction: column;

  .header .cogs-icon--type-cognite {
    width: 32px;
    color: black;
  }
  .botui_message {
    margin: 0;
    margin-bottom: 8px;
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
  .botui_message_content {
    background: #dadffc;
  }
  .botui_message_content.human {
    background: #f5f5f5;
  }
  .cogs-textarea {
    width: 100%;
    textarea {
      color: black !important;
    }
  }
  pre {
    overflow: hidden;
    margin-bottom: 0;
  }
`;
