import React from 'react';
import { Body, Button, Title } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { useDraftRows } from '../../hooks/useDraftRows';

import * as S from './elements';
import { BulkPopulationButton } from './BulkPopulationButton';

export const NoRowsOverlay: React.FC = () => {
  const { t } = useTranslation('NoRowsOverlay');
  const { createNewDraftRow } = useDraftRows();

  return (
    <S.NoRowsOverlay data-cy="no-rows-overlay">
      <Title level={5}>
        {t(
          'no-rows-overlay-text',
          'This data model type has currently no data'
        )}
      </Title>
      <Body level={2}>
        {t(
          'add-data-help-text',
          'Do you want to start by adding data manually in the table or load data in bulk through transformations?'
        )}
      </Body>
      <S.NoRowsOverlayButtons>
        <Button type="primary" icon="Add" onClick={createNewDraftRow}>
          {t('add-instance-button', 'Add instance')}
        </Button>
        <BulkPopulationButton />
      </S.NoRowsOverlayButtons>
    </S.NoRowsOverlay>
  );
};
