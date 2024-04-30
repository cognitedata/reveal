/*!
 * Copyright 2024 Cognite AS
 */

import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';
import { type RuleOutput } from './types';
import { type ReactElement } from 'react';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';

type RuleBasedOutputsPanelProps = {
  ruleOutputs?: RuleOutput[];
};

export const RuleBasedOutputsPanel = ({
  ruleOutputs
}: RuleBasedOutputsPanelProps): ReactElement => {
  return (
    <StyledRuleBasedOutputsPanel>
      {ruleOutputs !== undefined && ruleOutputs?.length > 0 && (
        <Flex direction="row" gap={14}>
          {ruleOutputs.map((output, index) => {
            return (
              <StyledOutputItem key={index}>
                <StyledBulletColor $backgroundColor={output.type === 'color' ? output.fill : ''} />
                <StyledLabel>{output.name ?? output.externalId}</StyledLabel>
              </StyledOutputItem>
            );
          })}
        </Flex>
      )}
    </StyledRuleBasedOutputsPanel>
  );
};

const StyledRuleBasedOutputsPanel = withSuppressRevealEvents(styled.div`
  display: flex;
  position: relative;
  bottom: 60px;
  min-width: 200px;
  max-width: 400px;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: var(--cogs-border-radius--default);
  font-size: 13px;
  line-height: 18px;
  outline: none;
  transition-property: transform, visibility, opacity;
  background-color: #ffffff;
  color: var(--cogs-text-color);
  box-shadow: var(--cogs-elevation--overlay);
  margin: auto;
  justify-content: space-around;
  flex-wrap: nowrap;
  align-content: space-around;
  align-items: stretch;
`);

const StyledOutputItem = styled.div`
  display: flex;
  padding-top: 7px;
  padding-bottom: 7px;
  width: 100%;
  gap: 8px;
  align-items: center;
`;

const StyledBulletColor = styled.span<{ $backgroundColor?: string }>`
  height: 15px;
  width: 15px;
  background: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 50%;
  display: inline-block;
`;

const StyledLabel = styled.span<{ $color?: string }>`
  color: ${({ $color }) => $color};
  line-height: 20px;
`;
