/*!
 * Copyright 2024 Cognite AS
 */

import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';
import { type RuleOutput } from './types';
import { useState, type ReactElement } from 'react';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { ShowMore } from './components/OutputPanelShowMore';
import { OutputPanelItem } from './components/OutputPanelItem';

const MAX_WHEN_NO_SHOW_MORE = 5;
const MAX_HEIGHT = '300px';

type RuleBasedOutputsPanelProps = {
  ruleOutputs?: RuleOutput[];
};

export const RuleBasedOutputsPanel = ({
  ruleOutputs
}: RuleBasedOutputsPanelProps): ReactElement => {
  const [isShowMore, setIsShowMore] = useState(false);

  return (
    <>
      {ruleOutputs !== undefined && ruleOutputs?.length > 0 && (
        <StyledRuleBasedOutputsPanel $showMore={isShowMore}>
          <Flex direction="column" gap={14}>
            {ruleOutputs.map((output, index) => {
              return (
                <>
                  {isShowMore || index <= MAX_WHEN_NO_SHOW_MORE - 1 ? (
                    <OutputPanelItem index={index} output={output} />
                  ) : (
                    <></>
                  )}
                </>
              );
            })}
            {ruleOutputs.length > MAX_WHEN_NO_SHOW_MORE && (
              <ShowMore
                isShowMore={isShowMore}
                onShowMore={() => {
                  setIsShowMore((previousState) => !previousState);
                }}
              />
            )}
          </Flex>
        </StyledRuleBasedOutputsPanel>
      )}
    </>
  );
};

const StyledRuleBasedOutputsPanel = withSuppressRevealEvents(styled.div<{ $showMore?: boolean }>`
  display: flex;
  position: absolute;
  bottom: 16px;
  left: 16px;
  min-width: 200px;
  max-width: 400px;
  max-height: ${({ $showMore }: { $showMore?: boolean }) =>
    $showMore ?? false ? MAX_HEIGHT : 'inherit'};
  border-radius: var(--cogs-border-radius--default);
  font-size: 13px;
  line-height: 18px;
  outline: none;
  transition-property: transform, visibility, opacity;
  background-color: #ffffff;
  color: var(--cogs-text-color);
  box-shadow: var(--cogs-elevation--overlay);
  margin: auto;
  justify-content: left;
  align-content: space-around;
  align-items: stretch;
  padding: 10px;
  overflow-y: auto;
`);
