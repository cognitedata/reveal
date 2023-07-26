import React from 'react';
import ReactMarkdown from 'react-markdown';

import styled from 'styled-components';

import { Body, Flex, A, Heading } from '@cognite/cogs.js';

import { CopilotTextMessage } from '../../../lib/types';

export const TextMessage = ({
  message: {
    data: { content, context },
  },
}: {
  message: { data: CopilotTextMessage & { source: 'user' | 'bot' } };
}) => {
  return (
    <Flex direction="column" gap={4} style={{ marginTop: 8 }}>
      <Markdown content={content} />
      {context && (
        <Body level={3} style={{ flex: 1 }} muted>
          {context}
        </Body>
      )}
    </Flex>
  );
};

type MarkdownProps = {
  content?: string;
};

const Markdown = ({ content = '' }: MarkdownProps): JSX.Element => {
  return (
    <div style={{ flex: 1 }}>
      <ReactMarkdown
        components={{
          a: (props) => <A {...props} />,
          code: (props) => <StyledMarkdownCode {...props} />,
          p: (props) => <Body level={2} {...props} />,
          h1: (props) => <Heading {...props} level={2} />,
          h2: (props) => <Heading {...props} level={3} />,
          h3: (props) => <Heading {...props} level={4} />,
        }}
      >
        {content.split('\n').join('  \n')}
      </ReactMarkdown>
    </div>
  );
};

const StyledMarkdownCode = styled.code`
  font-family: 'Source Code Pro', sans-serif;
  font-weight: 500;
`;
