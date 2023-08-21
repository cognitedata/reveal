import React from 'react';
import ReactMarkdown from 'react-markdown';

import styled from 'styled-components';

import { Body, A, Heading } from '@cognite/cogs.js';

type MarkdownProps = {
  content?: string;
  inverted?: boolean;
};

export const Markdown = ({
  content = '',
  inverted,
}: MarkdownProps): JSX.Element => {
  return (
    <div style={{ flex: 1 }}>
      <ReactMarkdown
        components={{
          a: (props) => <A {...props} />,
          code: (props) => <StyledMarkdownCode {...props} />,
          p: (props) => <Body size="medium" inverted={inverted} {...props} />,
          h1: (props) => <Heading {...props} level={2} inverted={inverted} />,
          h2: (props) => <Heading {...props} level={3} inverted={inverted} />,
          h3: (props) => <Heading {...props} level={4} inverted={inverted} />,
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
