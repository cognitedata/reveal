import styled from 'styled-components';

import { Chip, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../../hooks/useTranslation';

export const AILabels = () => {
  const { t } = useTranslation();
  return (
    <Wrapper gap={8}>
      <Chip
        size="x-small"
        className="ai-powered"
        label={t('AI_LABEL_AI_POWERED')}
      />
      <Chip size="x-small" className="ai-alpha" label={t('AI_LABEL_ALPHA')} />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  .ai-powered {
    background: var(
      --gradient-ai-small-surface,
      radial-gradient(174.05% 174.05% at 100% 95.83%, #8e5cff 0%, #2e1065 100%)
    );
    color: #fff;
    border-radius: 12px;
    font-weight: 600;
  }
  .ai-alpha {
    background: var(--surface-muted-inverted, #262626);
    color: #fff;
    border-radius: 12px;
    font-weight: 600;
  }
`;
