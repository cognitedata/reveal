/*!
 * Copyright 2024 Cognite AS
 */
import { useState, type ReactElement } from 'react';

import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import styled from 'styled-components';
import { useAll3dModels } from '../../hooks/useAll3dModels';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { RevealContext } from '../RevealContext/RevealContext';
import { type Model3D, type CogniteClient } from '@cognite/sdk';
import { ModesList } from './ModelsList';

export type SelectSingle3DModelButtonProps = {
  selectedScene: DmsUniqueIdentifier | undefined;
  setSelectedScene: (scene?: DmsUniqueIdentifier | undefined) => void;
  orientation?: 'horizontal' | 'none';
};

export const SelectSingle3DModelButton = (): ReactElement => {
  const sdk = useSDK();

  return (
    <RevealContext sdk={sdk}>
      <Single3DModelSelection sdk={sdk} />
    </RevealContext>
  );
};

export const Single3DModelSelection = (opts: { sdk: CogniteClient }): ReactElement => {
  const { data: models } = useAll3dModels(opts.sdk, true);

  const [selectedModel, setSelectedModel] = useState<Model3D | undefined>(undefined);

  const { t } = useTranslation();

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
            <ModesList
              models={models ?? []}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
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
