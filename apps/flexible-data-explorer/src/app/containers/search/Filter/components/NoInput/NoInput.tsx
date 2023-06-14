import * as React from 'react';

import { translationKeys } from '../../../../../common';
import { useTranslation } from '../../../../../hooks/useTranslation';

import { Container } from './elements';

export const NoInput: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      {t(
        translationKeys.filterNoInputText,
        "This filters doesn't contain any options inside"
      )}
    </Container>
  );
};
