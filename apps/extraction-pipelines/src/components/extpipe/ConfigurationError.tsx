import React from 'react';
import { ErrorVariations } from 'model/SDKErrors';
import { useTranslation } from 'common';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';

type Props = {
  error?: ErrorVariations | null;
  onCreate?: () => void;
};

export default function ConfigurationErrorFeedback({ error, onCreate }: Props) {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }

  switch (error.status) {
    case 404: {
      return (
        <ErrorFeedback>
          {t('configuration-404')}
          {onCreate && (
            <Button icon="AddLarge" onClick={onCreate} type="link">
              {t('create-configuration')}
            </Button>
          )}
        </ErrorFeedback>
      );
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
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 2rem 1rem;
`;
