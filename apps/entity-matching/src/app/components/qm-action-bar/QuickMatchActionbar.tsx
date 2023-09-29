import styled from 'styled-components';

import { Button, Flex, Title, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { RawSource, SourceType, TargetType } from '../../types/api';

type QuickMatchActionBarProps = {
  selectedRows: RawSource[] | number[];
  sourceType: SourceType | TargetType;
  onClose: () => void;
};

const QuickMatchActionBar = ({
  selectedRows,
  sourceType,
  onClose,
}: QuickMatchActionBarProps) => {
  const { t } = useTranslation();
  const shouldDisplay = !!selectedRows.length;

  if (!shouldDisplay) {
    return null;
  }

  return (
    <StyledActionBarContainer
      justifyContent="space-between"
      alignItems="center"
    >
      <StyledTitle level={5}>
        {t('n-source-type-selected', {
          count: selectedRows.length || 0,
          sourceType: t(`resource-type-${sourceType}`, {
            count: selectedRows.length || 0,
          }).toLocaleLowerCase(),
        })}
      </StyledTitle>
      <Tooltip
        content={t('clear-selection')}
        css={{ transform: 'translateY(-8px)' }}
      >
        <Button type="ghost" onClick={onClose} aria-label={t('close')} inverted>
          Clear selection
        </Button>
      </Tooltip>
    </StyledActionBarContainer>
  );
};

export default QuickMatchActionBar;

const StyledActionBarContainer = styled(Flex)`
  position: fixed;
  inset: auto 40px 24px;
  height: 56px;
  padding: 0px 16px;
  background-color: rgba(0, 0, 0, 0.9);
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
`;

const StyledTitle = styled(Title)`
  color: white;
`;
