import React from 'react';
import { ErrorVariations } from 'model/SDKErrors';
import { useTranslation } from 'common';
import styled from 'styled-components';

type Props = {
  error?: ErrorVariations | null;
};

export default function ConfigurationErrorFeedback({ error }: Props) {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }

  switch (error.status) {
    case 404: {
      return <ErrorFeedback>{t('configuration-404')}</ErrorFeedback>;
    }
    case 403: {
      return <ErrorFeedback>{t('configuration-403')}</ErrorFeedback>;
    }
    default: {
      return (
        <ErrorFeedback>
          <p>{t('configuration-generic-error')}</p>
          <pre>{error.message}</pre>
        </ErrorFeedback>
      );
    }
  }
}

const ErrorFeedback = styled.div`
  margin-left: 1rem;
`;
