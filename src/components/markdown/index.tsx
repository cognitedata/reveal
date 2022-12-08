import React from 'react';

import { A } from '@cognite/cogs.js';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

type MarkdownProps = {
  content?: string;
};

const Markdown = ({ content = '' }: MarkdownProps): JSX.Element => {
  return (
    <div>
      <ReactMarkdown
        components={{
          a: (props) => <A {...props} />,
          code: (props) => <StyledMarkdownCode {...props} />,
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
  padding: 1px 6px;
`;

export default Markdown;
