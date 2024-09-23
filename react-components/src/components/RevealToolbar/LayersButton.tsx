/*!
 * Copyright 2023 Cognite AS
 */

import { type Dispatch, type SetStateAction, type ReactElement } from 'react';
import { Button, Tooltip as CogsTooltip, LayersIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
import { LayersContainer } from '../RevealToolbar/LayersContainer/LayersContainer';

import { useTranslation } from '../i18n/I18n';

import { useSyncExternalLayersState } from './LayersContainer/useSyncExternalLayersState';
import { useModelHandlers } from './LayersContainer/useModelHandlers';
import { type DefaultLayersConfiguration, type LayersUrlStateParam } from '../../hooks/types';

export type LayersButtonProps = {
  layersState?: LayersUrlStateParam | undefined;
  setLayersState?: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined;
  defaultLayerConfiguration?: DefaultLayersConfiguration | undefined;
};

export const LayersButton = ({
  layersState: externalLayersState,
  setLayersState: setExternalLayersState,
  defaultLayerConfiguration
}: LayersButtonProps): ReactElement => {
  const { t } = useTranslation();

  const [modelLayerHandlers, update] = useModelHandlers(
    setExternalLayersState,
    defaultLayerConfiguration
  );

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    update
  );

  return (
    <Menu
      placement="right"
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={t('LAYERS_FILTER_TOOLTIP', 'Filter 3D resource layers')}
          placement="right"
          appendTo={document.body}>
          <Button {...props} type="ghost" icon=<LayersIcon /> aria-label="3D Resource layers" />
        </CogsTooltip>
      )}>
      <LayersContainer modelHandlers={modelLayerHandlers} update={update} />
    </Menu>
  );
};
