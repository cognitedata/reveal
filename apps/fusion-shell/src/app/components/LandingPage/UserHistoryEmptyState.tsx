import styled from 'styled-components';

import { Body, Colors, Flex } from '@cognite/cogs.js';

import images from '../../../assets/images';
import { useTranslation } from '../../../i18n';

import { UserHistoryProps } from './UserHistory';

const UserHistoryEmptyState = ({
  isRockwellDomains,
}: UserHistoryProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <StyledEmptyState
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap={12}
    >
      <StyledEmptyImg src={images.EmptyStateImg} alt="No history found" />
      <StyledEmptyDesc level={3} muted>
        {isRockwellDomains
          ? t('user-history-empty-desc-rockwell')
          : t('user-history-empty-desc')}
      </StyledEmptyDesc>
    </StyledEmptyState>
  );
};

const StyledEmptyState = styled(Flex)`
  width: 100%;
  height: 280px;
  border: 1px solid ${Colors['border--muted']};
  border-radius: 9px;
`;

const StyledEmptyImg = styled.img`
  width: 54px;
  height: 48px;
`;

const StyledEmptyDesc = styled(Body)`
  width: 212px;
  text-align: center;
`;

export default UserHistoryEmptyState;
