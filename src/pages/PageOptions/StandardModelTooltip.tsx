import React from 'react';
import styled from 'styled-components';
import { Body, Title, Colors } from '@cognite/cogs.js';
import { defaultModelOptions } from 'modules/workflows';
import { Flex } from 'components/Common';

const TooltipWrapper = styled(Flex)`
  padding: 8px 10px;
  & > * {
    margin: 8px 0;
  }
  & * {
    color: ${Colors.white.hex()};
  }
`;

export default function StandardModelTooltip() {
  return (
    <TooltipWrapper column>
      <Title level={5}>Default configurations</Title>
      <Flex column>
        <Title level={6}>Search field:</Title>
        <Body level={2}>
          This field determines the string to search for and to identify object
          entities.
        </Body>
        <Body level={2}>
          Default value = &quot;{defaultModelOptions.matchFields.files}&quot;
        </Body>
      </Flex>
      <Flex column>
        <Title level={6}>Partial match:</Title>
        <Body level={2}>
          Allow partial (fuzzy) matching of entities in the engineering
          diagrams. Creates a match only when it is possible to do so
          unambiguously.
        </Body>
        <Body level={2}>
          Default value: {String(defaultModelOptions.partialMatch)}
        </Body>
      </Flex>
      <Flex column>
        <Title level={6}>Minimum tokens:</Title>
        <Body level={2}>
          Each detected item must match the detected entity on at least this
          number of tokens. A token is a substring of consecutive letters or
          digits.
        </Body>
        <Body level={2}>Default value: {defaultModelOptions.minTokens}</Body>
      </Flex>
    </TooltipWrapper>
  );
}
