import {
  useManualPopulationFeatureFlag,
  useTransformationsFeatureFlag,
} from '@platypus-app/flags';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Button, Title } from '@cognite/cogs.js';

import { useDraftRows } from '../../hooks/useDraftRows';
import useTransformations from '../../hooks/useTransformations';
import { BulkPopulationButton } from '../BulkPopulationButton';

import * as S from './elements';

export type NoRowsOverlayProps = {
  space: string;
  onLoadDataClick: () => void;
  typeName: string;
  version: string;
};

export const NoRowsOverlay = ({
  space,
  onLoadDataClick,
  typeName,
  version,
}: NoRowsOverlayProps) => {
  const { t } = useTranslation('NoRowsOverlay');
  const { createNewDraftRow } = useDraftRows();
  const { isEnabled: isManualPopulationEnabled } =
    useManualPopulationFeatureFlag();
  const isTransformationsEnabled = useTransformationsFeatureFlag();
  const { data: transformations = [] } = useTransformations({
    space,
    isEnabled: isTransformationsEnabled,
    typeName,
    version,
  });

  if (isTransformationsEnabled && transformations.length > 0) {
    return null;
  }

  let addDataHelpText = '';

  if (isManualPopulationEnabled && isTransformationsEnabled) {
    addDataHelpText = t(
      'add-data-help-text-with-manual-population-and-transformations',
      'Do you want to start by adding data manually in the table or load data in bulk through transformations?'
    );
  } else if (isManualPopulationEnabled) {
    addDataHelpText = t(
      'add-data-help-text-with-manual-population',
      'Do you want to start by adding data manually in the table?'
    );
  } else if (isTransformationsEnabled) {
    addDataHelpText = t(
      'add-data-help-text-with-transformation',
      'Do you want to start by loading data in bulk through transformations?'
    );
  }

  return (
    <S.NoRowsOverlay data-cy="no-rows-overlay">
      <Title level={5}>
        {t(
          'no-rows-overlay-text',
          'This data model type has currently no data'
        )}
      </Title>
      {addDataHelpText && <Body level={2}>{addDataHelpText}</Body>}
      <S.NoRowsOverlayButtons>
        {isManualPopulationEnabled && (
          <Button type="primary" icon="Add" onClick={createNewDraftRow}>
            {t('add-instance-button', 'Add instance')}
          </Button>
        )}
        {isTransformationsEnabled && (
          <BulkPopulationButton onClick={onLoadDataClick}>
            {t('load-data-button', 'Populate in bulk')}
          </BulkPopulationButton>
        )}
      </S.NoRowsOverlayButtons>
    </S.NoRowsOverlay>
  );
};
