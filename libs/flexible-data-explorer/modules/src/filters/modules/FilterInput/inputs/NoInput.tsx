import * as React from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import styled from 'styled-components/macro';

export const NoInput: React.FC = () => {
  const { t } = useTranslation();

  return <Container>{t('FILTER_NO_INPUT_OPTIONS')}</Container>;
};

const Container = styled.div`
  color: var(--cogs-text-icon--muted);
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  letter-spacing: -0.006em;
  font-feature-settings: 'ss04' on;
  padding: 8px;
`;
