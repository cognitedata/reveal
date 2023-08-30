import React from 'react';

import { useTranslation } from '../../common/i18n';
import {
  StyledContent,
  StyledSelectSignInMethodContainer,
} from '../../components/containers';

type Props = {
  error?: any;
};

export default function GenericError({ error }: Props) {
  const { t } = useTranslation();

  return (
    <StyledSelectSignInMethodContainer>
      <StyledContent>
        <p>{t('error-domain-generic')}</p>
        {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      </StyledContent>
    </StyledSelectSignInMethodContainer>
  );
}
