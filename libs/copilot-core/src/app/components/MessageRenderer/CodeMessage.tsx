import { useState } from 'react';
import Highlight from 'react-highlight';

import styled from 'styled-components';

import { Body, Flex, Icon, Modal } from '@cognite/cogs.js';
import {
  CopilotCodeMessage,
  CopilotDataModelQueryMessage,
  sendFromCopilotEvent,
} from '@cognite/llm-hub';

import { getContainer } from '../../utils/getContainer';
import { Editor } from '../Editor/Editor';

import { ResponsiveActions } from './components/ResponsiveActions';
import { MessageBase } from './MessageBase';

export const CodeMessage = ({
  message: { data },
}: {
  message: { data: CopilotCodeMessage | CopilotDataModelQueryMessage };
}) => {
  const { actions: prevActions } = data;
  const content =
    data.type === 'data-model-query' ? data.graphql.query : data.content;
  const language = data.type === 'data-model-query' ? 'graphql' : data.language;
  const prevContent = data.type === 'data-model-query' ? '' : data.prevContent;
  // handle breaking change in message format
  const actions =
    data.type === 'data-model-query'
      ? [
          {
            content: 'View results',
            onClick: () => {
              sendFromCopilotEvent('USE_CODE', {
                content,
              });
            },
          },
          ...(prevActions || []),
        ]
      : [
          {
            content: 'Use code',
            onClick: () => {
              sendFromCopilotEvent('USE_CODE', {
                content,
              });
            },
          },
          ...(prevActions || []),
        ];
  const [open, setOpen] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  return (
    <MessageBase message={{ data: { ...data, source: 'bot' } }}>
      <Wrapper direction="column" gap={4}>
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
            className="hover-code"
            justifyContent="center"
            alignItems="center"
          >
            <Icon type="Expand" />
          </Flex>
          <Highlight className={language}>{content}</Highlight>
        </Flex>
        <Modal
          visible={open}
          title="Code preview"
          size="full-screen"
          onCancel={() => setOpen(false)}
          hideFooter
          hidePaddings
          getContainer={getContainer()}
          className="full-height"
        >
          <Flex
            direction="column"
            gap={16}
            style={{ padding: 16, height: '100%' }}
          >
            <Flex style={{ flex: 1 }}>
              <Editor
                language={language}
                code={content}
                prevCode={showDiff ? prevContent : undefined}
              />
            </Flex>
            <ResponsiveActions
              actions={[
                ...(prevContent
                  ? [
                      {
                        content: showDiff ? 'Hide Diff' : 'Show Diff',
                        onClick: () => setShowDiff(!showDiff),
                      },
                    ]
                  : []),
                ...actions,
              ]}
            />
          </Flex>
        </Modal>
      </Wrapper>
    </MessageBase>
  );
};

const Wrapper = styled(Flex)`
  width: 100%;
  pre {
    width: 100%;
  }
  .hover-code {
    position: absolute;
    width: 100%;
    height: 100%;

    i {
      color: white;
    }
  }
`;
