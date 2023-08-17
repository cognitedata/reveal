import React from 'react';
import ReactMarkdown from 'react-markdown';

import styled from 'styled-components';

import { Body, A, Heading } from '@cognite/cogs.js';

type MarkdownProps = {
  content?: string;
};

export const Markdown = ({ content = '' }: MarkdownProps): JSX.Element => {
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
