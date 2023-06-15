import { useState } from 'react';
import Highlight from 'react-highlight';

import { Body, Button, Flex, Icon, Modal } from '@cognite/cogs.js';

import { CopilotCodeMessage, CopilotTextMessage } from '../../../lib/types';
import { Editor } from '../Editor/Editor';

const TextMessage = ({
  message: {
    data: { content, actions },
  },
}: {
  message: { data: CopilotTextMessage };
}) => {
  return (
    <Flex direction="column" gap={4}>
      <Body level={2}>{content}</Body>
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
  );
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

export const messageRenderers = {
  text: TextMessage,
  code: CodeMessage,
};
