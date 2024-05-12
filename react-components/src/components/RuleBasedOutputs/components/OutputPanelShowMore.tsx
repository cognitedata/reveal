import { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import { Button, Flex } from '@cognite/cogs.js';
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
          icon={!isShowMore ? 'Add' : 'Remove'}
          type="ghost-accent">
          {isShowMore ? t('SHOW_LESS', 'Show less') : t('SHOW_MORE', 'Show more')}
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
