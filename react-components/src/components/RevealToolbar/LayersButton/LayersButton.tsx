/*!
 * Copyright 2024 Cognite AS
 */

import { type Dispatch, type SetStateAction, useCallback, type ReactElement } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { type UpdateModelHandlersCallback, useModelHandlers } from './useModelHandlers';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { SelectPanel } from '@cognite/cogs-lab';
import { Button, ChevronRightSmallIcon, IconWrapper, LayersIcon } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { ModelLayersList } from './ModelLayersList';
import { type DefaultLayersConfiguration, type LayersUrlStateParam } from './types';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../../constants';

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
  const viewer = useReveal();

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

  const updateCallback = useCallback(() => {
    update(viewer.models, viewer.get360ImageCollections());
  }, [update]);

  return (
    <>
      <SelectPanel placement="right" hideOnOutsideClick offset={TOOLBAR_HORIZONTAL_PANEL_OFFSET}>
        <SelectPanel.Trigger>
          <Button icon=<LayersIcon /> type="ghost" />
        </SelectPanel.Trigger>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label={t('CAD_MODELS', 'CAD models')}
              modelLayerHandlers={modelLayerHandlers.cadHandlers}
              update={updateCallback}
            />
            <ModelLayerSelection
              label={t('POINT_CLOUDS', 'Pointclouds')}
              modelLayerHandlers={modelLayerHandlers.pointCloudHandlers}
              update={updateCallback}
            />
            <ModelLayerSelection
              label={t('360_IMAGES', '360 images')}
              modelLayerHandlers={modelLayerHandlers.image360Handlers}
              update={updateCallback}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    </>
  );
};

const ModelLayerSelection = ({
  label,
  modelLayerHandlers,
  update
}: {
  label: string;
  modelLayerHandlers: ModelHandler[];
  update: UpdateModelHandlersCallback;
}): ReactElement => {
  const isDisabled = modelLayerHandlers.length === 0;

  const viewer = useReveal();
  const updateCallback = useCallback(() => {
    update(viewer.models, viewer.get360ImageCollections());
  }, [update]);

  return (
    <SelectPanel placement="right" hideOnOutsideClick={true} openOnHover={!isDisabled}>
      <SelectPanel.Trigger>
        <WholeLayerVisibilitySelectItem
          label={label}
          modelLayerHandlers={modelLayerHandlers}
          update={updateCallback}
          trailingContent={
            <IconWrapper size={16}>
              <ChevronRightSmallIcon />
            </IconWrapper>
          }
          disabled={isDisabled}
        />
      </SelectPanel.Trigger>
      <SelectPanel.Body>
        <ModelLayersList
          modelLayerHandlers={modelLayerHandlers}
          update={updateCallback}
          disabled={isDisabled}
        />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
