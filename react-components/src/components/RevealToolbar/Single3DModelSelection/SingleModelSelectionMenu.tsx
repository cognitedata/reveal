/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import styled from 'styled-components';
import { type CogniteClient } from '@cognite/sdk';
import { ModelsList } from './ModelsList';
import {
  type SelectedThreeDResourceContent,
  type ModelWithRevision,
  type SingleModelData
} from '../../../hooks/types';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { useAll3dModels } from '../../../hooks/useAll3dModels';
import { useRevisions } from '../../../hooks/useRevisions';

type SingleModelSelectionMenuProps = {
  sdk: CogniteClient;
  selectedResource?: DmsUniqueIdentifier | SingleModelData | undefined;
  onModelChange: (model: SelectedThreeDResourceContent | undefined) => void;
};

export const SingleModelSelectionMenu = ({
  sdk,
  selectedResource,
  onModelChange
}: SingleModelSelectionMenuProps): ReactElement => {
  const { t } = useTranslation();

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

  const handleSingleModelChange = (model: ModelWithRevision | undefined): void => {
    if (model?.model.id === undefined) return;

    const singleModelData: SelectedThreeDResourceContent = {
      type: 'model',
      modelId: model?.model.id,
      revisionId: model?.revision.id,
      name: model?.model.name
    };

    onModelChange(singleModelData);
  };

  return (
    <StyledMenu>
      <Menu.Header>{t('MODEL_SELECT_HEADER', 'Select 3D model')}</Menu.Header>
      <ModelsList
        modelsWithRevision={modelsWithRevision ?? []}
        selectedModel={selectedModel}
        onModelChange={handleSingleModelChange}
      />
    </StyledMenu>
  );
};

const StyledMenu = styled(Menu)`
  max-height: 400px;
  overflow: auto;
`;
