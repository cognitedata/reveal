/*!
 * Copyright 2024 Cognite AS
 */

import styled from 'styled-components';

import { Flex, Button } from '@cognite/cogs.js';
import { type RuleOutput } from './types';
import { useState, type ReactNode, type ReactElement } from 'react';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { useTranslation } from '../i18n/I18n';

const MAX_WHEN_NO_SHOW_MORE = 5;
const MAX_HEIGHT = '300px';

type RuleBasedOutputsPanelProps = {
  ruleOutputs?: RuleOutput[];
};

export const RuleBasedOutputsPanel = ({
  ruleOutputs
}: RuleBasedOutputsPanelProps): ReactElement => {
  const [isShowMore, setIsShowMore] = useState(false);

  const { t } = useTranslation();

  return (
    <>
      {ruleOutputs !== undefined && ruleOutputs?.length > 0 && (
        <StyledRuleBasedOutputsPanel $showMore={isShowMore}>
          <Flex direction="column" gap={14}>
            {ruleOutputs.map((output, index) => {
              return (
                <>
                  {isShowMore || index <= MAX_WHEN_NO_SHOW_MORE - 1 ? (
                    <StyledOutputItem key={index}>
                      <StyledBulletColor
                        $backgroundColor={output.type === 'color' ? output.fill : ''}
                      />
                      <StyledLabel>
                        {output.label ?? (output.type === 'color' ? output.fill : '')}
                      </StyledLabel>
                    </StyledOutputItem>
                  ) : (
                    <></>
                  )}
                </>
              );
            })}
            {ruleOutputs.length > MAX_WHEN_NO_SHOW_MORE && (
              <StyledOutputItem key={'rule-based-panel-show-more'}>
                <ShowMore
                  isShowMore={isShowMore}
                  onShowMore={() => {
                    setIsShowMore((previousState) => !previousState);
                  }}>
                  {isShowMore ? t('SHOW_LESS', 'Show less') : t('SHOW_MORE', 'Show more')}
                </ShowMore>
              </StyledOutputItem>
            )}
          </Flex>
        </StyledRuleBasedOutputsPanel>
      )}
    </>
  );
};

const ShowMore = ({
  onShowMore,
  isShowMore,
  children
}: {
  onShowMore: () => void;
  isShowMore: boolean;
  children?: ReactNode;
}): ReactElement => {
  return (
    <Flex justifyContent="center" gap={8}>
      <Button
        size="small"
        onClick={onShowMore}
        icon={!isShowMore ? 'Add' : 'Remove'}
        type="ghost-accent">
        {children}
      </Button>
    </Flex>
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
    $showMore === true ? MAX_HEIGHT : 'inherit'};
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

const StyledOutputItem = styled.div`
  display: flex;
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
