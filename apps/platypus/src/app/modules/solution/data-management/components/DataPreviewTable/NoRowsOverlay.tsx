import { Body, Button, Title } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useManualPopulationFeatureFlag } from '@platypus-app/flags';

import { useDraftRows } from '../../hooks/useDraftRows';

import * as S from './elements';
import { BulkPopulationButton } from '../BulkPopulationButton';
import useTransformations from '../../hooks/useTransformations';

export type NoRowsOverlayProps = {
  dataModelExternalId: string;
  onLoadDataClick: () => void;
  typeName: string;
  version: string;
};

export const NoRowsOverlay = ({
  dataModelExternalId,
  onLoadDataClick,
  typeName,
  version,
}: NoRowsOverlayProps) => {
  const { t } = useTranslation('NoRowsOverlay');
  const { createNewDraftRow } = useDraftRows();
  const { isEnabled } = useManualPopulationFeatureFlag();
  const { data: transformations } = useTransformations({
    dataModelExternalId,
    isEnabled: true,
    typeName,
    version,
  });

  if (!transformations || transformations.length > 0) {
    return null;
  }

  const addDataHelpText = isEnabled
    ? t(
        'add-data-help-text-with-manual-population',
        'Do you want to start by adding data manually in the table or load data in bulk through transformations?'
      )
    : t(
        'add-data-help-text-without-manual-population',
        'Do you want to start by loading data in bulk through transformations?'
      );

  return (
    <S.NoRowsOverlay data-cy="no-rows-overlay">
      <Title level={5}>
        {t(
          'no-rows-overlay-text',
          'This data model type has currently no data'
        )}
      </Title>
      <Body level={2}>{addDataHelpText}</Body>
      <S.NoRowsOverlayButtons>
        {isEnabled && (
          <Button type="primary" icon="Add" onClick={createNewDraftRow}>
            {t('add-instance-button', 'Add instance')}
          </Button>
        )}
        <BulkPopulationButton onClick={onLoadDataClick}>
          {t('load-data-button', 'Populate in bulk')}
        </BulkPopulationButton>
      </S.NoRowsOverlayButtons>
    </S.NoRowsOverlay>
  );
};
