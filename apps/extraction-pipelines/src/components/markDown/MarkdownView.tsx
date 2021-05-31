import React, { FunctionComponent, PropsWithChildren } from 'react';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

const StyledReactMarkdown = styled(ReactMarkdown)`
  &.documentation {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    h1.docs-heading {
      margin: 1rem 0;
      align-self: flex-start;
    }
    code {
      display: flex;
      margin: 1rem 0;
      padding: 1rem;
      background-color: ${Colors['greyscale-grey2'].hex()};
      border-left: 4px solid ${Colors['greyscale-grey3'].hex()};
    }
    blockquote {
      margin: 1rem 0;
      padding: 1rem 1rem 0 1rem;
      background-color: ${Colors['midblue-8'].hex()};
      border-left: 4px solid ${Colors['midblue-7'].hex()};
    }
    .cogs-table {
      width: inherit;
    }
    .docs-image {
      max-width: 100%;
    }
  }
`;
interface MarkdownViewProps {}

export const MarkdownView: FunctionComponent<MarkdownViewProps> = ({
  children,
}: PropsWithChildren<MarkdownViewProps>) => {
  const styledComponents = {
    // eslint-disable-next-line jsx-a11y/heading-has-content
    h1: ({ ...props }) => <h1 className="docs-heading" {...props} />,
    table: ({ ...props }) => <table className="cogs-table" {...props} />,
    // eslint-disable-next-line jsx-a11y/alt-text
    img: ({ ...props }) => <img className="docs-image" {...props} />,
  };
  return (
    <StyledReactMarkdown
      className="documentation"
      remarkPlugins={[gfm]}
      components={styledComponents}
    >
      {children as string}
    </StyledReactMarkdown>
  );
};
