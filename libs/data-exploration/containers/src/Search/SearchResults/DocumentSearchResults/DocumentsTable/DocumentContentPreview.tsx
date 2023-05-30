import React from 'react';

import styled from 'styled-components';

import { HighlightCell } from '@data-exploration/components';

import { Body, Flex } from '@cognite/cogs.js';

import { InternalDocument } from '@data-exploration-lib/domain-layer';

import { getFocusedHighlightContent, getHighlightContent } from './utils';

export const DocumentContentPreview = ({
  document,
  query,
}: {
  document: InternalDocument;
  query: string | undefined;
}) => {
  const highlightContent = getHighlightContent(document);
  const content = getFocusedHighlightContent(highlightContent);

  return (
    <Body level={2}>
      <Flex alignItems="center">
        <StyledContentHighlight>
          <HighlightCell text={content} query={query} lines={1} />
        </StyledContentHighlight>
      </Flex>
    </Body>
  );
};

const StyledContentHighlight = styled.div`
  word-break: break-all;
`;
