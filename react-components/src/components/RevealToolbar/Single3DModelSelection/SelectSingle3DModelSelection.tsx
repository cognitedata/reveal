/*!
 * Copyright 2024 Cognite AS
 */
import { useCallback, type ReactElement } from 'react';

import { Button, Dropdown, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import { useAll3dModels } from '../../../hooks/useAll3dModels';
import { type CogniteClient } from '@cognite/sdk';
import { useRevisions } from '../../../hooks/useRevisions';
import { type ModelWithRevision, type SingleModelIds } from '../../../hooks/types';
import { SingleModelSelectionMenu } from './SingleModelSelectionMenu';
import { type DmsUniqueIdentifier } from '../../../data-providers/FdmSDK';

type Single3DModelSelectionProps = {
  sdk: CogniteClient;
  onModelChange: (model: ModelWithRevision | undefined) => void;
  selectedResource?: DmsUniqueIdentifier | SingleModelIds | undefined;
};

export const Single3DModelSelection = ({
  sdk,
  onModelChange,
  selectedResource
}: Single3DModelSelectionProps): ReactElement => {
  const { data: models } = useAll3dModels(sdk, true);

  const { data: modelsWithRevision } = useRevisions(sdk, models);

  const selectedModel =
    selectedResource !== undefined &&
    'modelId' in selectedResource &&
    'revisionId' in selectedResource
      ? modelsWithRevision?.find(
          (model) =>
            model.model.id === selectedResource.modelId &&
            model.revision.id === selectedResource.revisionId
        )
      : undefined;

  const { t } = useTranslation();

  console.log('TEST selectedModel', selectedModel, selectedResource);

  const handleSelectedModelChange = useCallback((model: ModelWithRevision | undefined): void => {
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
