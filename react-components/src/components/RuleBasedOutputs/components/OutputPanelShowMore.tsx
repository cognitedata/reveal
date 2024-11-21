/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';
import styled from 'styled-components';
import { AddIcon, Button, Flex, RemoveIcon } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';

type OutputPanelShowMoreProps = {
  onShowMore: () => void;
  isShowMore: boolean;
};

export const ShowMore = ({ onShowMore, isShowMore }: OutputPanelShowMoreProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <StyledOutputItem $showMore={isShowMore} key={'rule-based-panel-show-more'}>
      <Flex justifyContent="center" gap={8}>
        <Button
          size="small"
          onClick={onShowMore}
          icon={!isShowMore ? <AddIcon /> : <RemoveIcon />}
          type="ghost-accent">
          {isShowMore ? t({ key: 'SHOW_LESS' }) : t({ key: 'SHOW_MORE' })}
        </Button>
      </Flex>
    </StyledOutputItem>
  );
};

const StyledOutputItem = styled.div<{ $showMore?: boolean }>`
  display: flex;
  width: 100%;
  gap: 8px;
  align-items: center;
  padding-bottom: ${({ $showMore }: { $showMore?: boolean }) =>
    $showMore === true ? '10px' : 'inherit'};
  align-content: baseline;
`;
