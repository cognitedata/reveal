/*!
 * Copyright 2024 Cognite AS
 */
import { useCallback, useState, type ReactElement } from 'react';

import { Button, Dropdown, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import { useAll3dModels } from '../../../hooks/useAll3dModels';
import { type CogniteClient } from '@cognite/sdk';
import { useRevisions } from '../../../hooks/useRevisions';
import { type ModelWithRevision } from '../../../hooks/types';
import { SingleModelSelectionMenu } from './SingleModelSelectionMenu';

type Single3DModelSelectionProps = {
  sdk: CogniteClient;
  onModelChange: (model: ModelWithRevision | undefined) => void;
};

export const Single3DModelSelection = ({
  sdk,
  onModelChange
}: Single3DModelSelectionProps): ReactElement => {
  const { data: models } = useAll3dModels(sdk, true);

  const { data: modelsWithRevision } = useRevisions(sdk, models);

  const [selectedModel, setSelectedModel] = useState<ModelWithRevision | undefined>();

  const { t } = useTranslation();

  const handleSelectedModelChange = useCallback((model: ModelWithRevision | undefined): void => {
    setSelectedModel(model);
    onModelChange(model);
  }, []);

  return (
    <CogsTooltip
      content={t('MODEL_SELECT_HEADER', 'Select 3D model')}
      placement="right"
      appendTo={document.body}>
      <Dropdown
        placement="right-start"
        content={
          <SingleModelSelectionMenu
            sdk={sdk}
            selectedModel={selectedModel}
            modelsWithRevision={modelsWithRevision}
            onModelChange={handleSelectedModelChange}
          />
        }>
        <Button icon="World" aria-label="Select 3D model" type="ghost"></Button>
      </Dropdown>
    </CogsTooltip>
  );
};
