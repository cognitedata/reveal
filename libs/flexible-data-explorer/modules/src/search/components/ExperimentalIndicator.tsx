import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import styled from 'styled-components/macro';

import { Chip } from '@cognite/cogs.js';

export const ExperimentalIndicator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <BetaIcon />
      <Chip label={t('SEARCH_BAR_EXPERIMENTAL')} size="x-small" />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const BetaIcon = styled.div`
  align-self: center;

  &::after {
    content: 'β';
    color: var(--cogs-border--status-critical--strong);
    font-size: 10px;
    font-weight: 500;
    position: relative;
    bottom: 4px;
    right: 0px;
    width: 30px;
    height: 20px;
  }
`;
