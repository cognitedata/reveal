import React from 'react';
import {
  Document,
  getHighlightContent,
  getFocusedHighlightContent,
} from 'domain/documents';
import styled from 'styled-components';
import { HighlightCell } from 'components';
import { Body, Flex } from '@cognite/cogs.js';

export const DocumentContentPreview = ({
  document,
  query,
}: {
  document: Document;
  query: string | undefined;
}) => {
  const highlightContent = getHighlightContent(document);
  const content = getFocusedHighlightContent(highlightContent);

  return (
    <Body level={2}>
      <Flex alignItems="center">
        <StyledContentHighlight>
          <HighlightCell text={content} query={query} />
        </StyledContentHighlight>
      </Flex>
    </Body>
  );
};

const StyledContentHighlight = styled.div`
  word-break: break-all;
`;
