import * as React from 'react';

import { useTranslation } from '../../../../hooks/useTranslation';

import { Container } from './elements';

export const NoInput: React.FC = () => {
  const { t } = useTranslation();

  return <Container>{t('FILTER_NO_INPUT_OPTIONS')}</Container>;
};
