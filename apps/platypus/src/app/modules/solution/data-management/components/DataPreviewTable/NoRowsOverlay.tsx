import { Body, Button, Title } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { useDraftRows } from '../../hooks/useDraftRows';

import * as S from './elements';
import { BulkPopulationButton } from '../BulkPopulationButton/BulkPopulationButton';
import useTransformations from '../../hooks/useTransformations';

export type NoRowsOverlayProps = {
  dataModelExternalId: string;
  typeName: string;
  version: string;
};

export const NoRowsOverlay = ({
  dataModelExternalId,
  typeName,
  version,
}: NoRowsOverlayProps) => {
  const { t } = useTranslation('NoRowsOverlay');
  const { createNewDraftRow } = useDraftRows();
  const { data: transformations } = useTransformations({
    dataModelExternalId,
    isEnabled: true,
    typeName,
    version,
  });

  if (!transformations || transformations.length > 0) {
    return null;
  }

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
