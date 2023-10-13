import { useMemo, useState } from 'react';
import Highlight from 'react-highlight';

import styled from 'styled-components';

import { Body, Flex, Icon, Modal } from '@cognite/cogs.js';

import { CopilotCodeResponse } from '../../../lib/types';
import { useCopilotContext } from '../../hooks/useCopilotContext';
import { getContainer } from '../../utils/getContainer';
import { Editor } from '../Editor/Editor';

import { ResponsiveActions } from './components/ResponsiveActions';
import { MessageBase } from './MessageBase';

export const CodeMessage = ({
  message: { data },
}: {
  message: { data: CopilotCodeResponse & { source: 'bot' } };
}) => {
  const { actionGetters } = useCopilotContext();
  const content = data.content;
  const language = data.language;
  const prevContent = data.prevContent;
  const actions = useMemo(() => {
    return (actionGetters[data.type] || [])
      .map((actionGetter) => actionGetter(data))
      .flat();
  }, [actionGetters, data]);
  const [open, setOpen] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  return (
    <MessageBase message={{ ...data, source: 'bot' }}>
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
  position: relative;
  pre {
    width: 100%;
  }
  .hover-code {
    position: absolute;
    width: 100%;
    height: 100%;
    transition: all 0.2s ease-in-out;
    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    i {
      color: white;
    }
  }
`;
