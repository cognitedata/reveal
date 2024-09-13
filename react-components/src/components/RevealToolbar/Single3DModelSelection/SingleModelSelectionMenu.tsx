/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import styled from 'styled-components';
import { type CogniteClient } from '@cognite/sdk';
import { ModelsList } from './ModelsList';
import { type ModelWithRevision } from '../../../hooks/types';

type SingleModelSelectionMenuProps = {
  sdk: CogniteClient;
  selectedModel: ModelWithRevision | undefined;
  modelsWithRevision: ModelWithRevision[] | undefined;
  onModelChange: (model: ModelWithRevision | undefined) => void;
};

export const SingleModelSelectionMenu = ({
  selectedModel,
  modelsWithRevision,
  onModelChange
}: SingleModelSelectionMenuProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <StyledMenu>
      <Menu.Header>{t('MODEL_SELECT_HEADER', 'Select 3D model')}</Menu.Header>
      <ModelsList
        modelsWithRevision={modelsWithRevision ?? []}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
    </StyledMenu>
  );
};

const StyledMenu = styled(Menu)`
  max-height: 400px;
  overflow: auto;
`;
