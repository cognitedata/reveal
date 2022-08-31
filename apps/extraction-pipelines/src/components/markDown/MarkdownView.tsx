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
    h1,
    h2,
    h3,
    h4 {
      margin-top: 0.5rem;
    }
    pre {
      code {
        display: flex;
        margin: 1rem 0;
        padding: 1rem;
        background-color: ${Colors['greyscale-grey2'].hex()};
        border-left: 4px solid ${Colors['greyscale-grey3'].hex()};
      }
    }
    p {
      line-height: 1.3;
      code {
        padding: 0.1rem 0.2rem;
        background-color: ${Colors['greyscale-grey2'].hex()};
        border: 1px solid ${Colors['greyscale-grey3'].hex()};
      }
    }
    blockquote {
      margin: 1rem 0;
      padding: 1rem 1rem 0 1rem;
      background-color: ${Colors['midblue-8'].hex()};
      border-left: 4px solid ${Colors['midblue-7'].hex()};
    }
    .cogs-table {
      width: inherit;
      margin-bottom: 1rem;
      tbody {
        tr {
          td {
            line-height: 1.3;
          }
        }
      }
    }
    .docs-image {
      max-width: 100%;
    }
    ul {
      margin-top: 0.5rem;
      li {
        margin-bottom: 0.5rem;
      }
    }
  }
`;
interface MarkdownViewProps {}

export const MarkdownView: FunctionComponent<MarkdownViewProps> = ({
  children,
}: PropsWithChildren<MarkdownViewProps>) => {
  const styledComponents = {
    h1: ({ ...props }) => <h1 className="docs-heading" {...props} />,
    table: ({ ...props }) => <table className="cogs-table" {...props} />,
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
