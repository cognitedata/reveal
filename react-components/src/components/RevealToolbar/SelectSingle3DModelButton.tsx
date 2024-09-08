/*!
 * Copyright 2024 Cognite AS
 */
import { useState, type ReactElement } from 'react';

import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import styled from 'styled-components';
import { useAll3dModels } from '../../hooks/useAll3dModels';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { RevealContext } from '../RevealContext/RevealContext';
import { type CogniteClient } from '@cognite/sdk';
import { ModelsList } from './ModelsList';
import { useRevisions } from '../../hooks/useRevisions';
import { type ModelWithRevision } from '../../hooks/types';

type SelectSingle3DModelButtonProps = {
  onSingleModelChanged?: (model: ModelWithRevision | undefined) => void;
};

export const SelectSingle3DModelButton = ({
  onSingleModelChanged
}: SelectSingle3DModelButtonProps): ReactElement => {
  const sdk = useSDK();

  const handleSingleModelChange = (model: ModelWithRevision | undefined): void => {
    if (onSingleModelChanged !== undefined) onSingleModelChanged(model);
  };

  return (
    <RevealContext sdk={sdk}>
      <Single3DModelSelection sdk={sdk} onModelChange={handleSingleModelChange} />
    </RevealContext>
  );
};

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

  const [selectedModel, setSelectedModel] = useState<ModelWithRevision | undefined>(undefined);

  const { t } = useTranslation();

  const handleSelectedModelChange = (model: ModelWithRevision | undefined): void => {
    setSelectedModel(model);
    onModelChange(model);
  };

  return (
    <CogsTooltip
      content={t('MODEL_SELECT_HEADER', 'Select 3D model')}
      placement="right"
      appendTo={document.body}>
      <Dropdown
        placement="right-start"
        content={
          <StyledMenu>
            <Menu.Header>{t('MODEL_SELECT_HEADER', 'Select 3D model')}</Menu.Header>
            <ModelsList
              modelsWithRevision={modelsWithRevision ?? []}
              selectedModel={selectedModel}
              onModelChange={handleSelectedModelChange}
            />
          </StyledMenu>
        }>
        <Button icon="World" aria-label="Select 3D model" type="ghost"></Button>
      </Dropdown>
    </CogsTooltip>
  );
};

const StyledMenu = styled(Menu)`
  max-height: 400px;
  overflow: auto;
`;
