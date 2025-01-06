/*!
 * Copyright 2024 Cognite AS
 */

import { type Dispatch, type SetStateAction, useCallback, type ReactElement } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { type UpdateModelHandlersCallback, useModelHandlers } from './useModelHandlers';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { SelectPanel } from '@cognite/cogs-lab';
import { Button, ChevronRightSmallIcon, IconWrapper, LayersIcon, Tooltip } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { useRenderTarget, useReveal } from '../../RevealCanvas/ViewerContext';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { ModelLayersList } from './ModelLayersList';
import { type DefaultLayersConfiguration, type LayersUrlStateParam } from './types';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../../constants';
import { CommandsUpdater } from '../../../architecture/base/reactUpdaters/CommandsUpdater';
import { LabelWithShortcut } from '../../Architecture/LabelWithShortcut';

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
  const renderTarget = useRenderTarget();

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
    CommandsUpdater.update(renderTarget);
  }, [update]);

  return (
    <>
      <SelectPanel
        placement="right"
        appendTo={'parent'}
        hideOnOutsideClick
        offset={TOOLBAR_HORIZONTAL_PANEL_OFFSET}>
        <SelectPanel.Trigger>
          <Tooltip
            content={<LabelWithShortcut label={t({ key: 'LAYERS_FILTER_TOOLTIP' })} />}
            placement="right">
            <Button icon=<LayersIcon /> type="ghost" />
          </Tooltip>
        </SelectPanel.Trigger>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label={t({ key: 'CAD_MODELS' })}
              modelLayerHandlers={modelLayerHandlers.cadHandlers}
              update={updateCallback}
            />
            <ModelLayerSelection
              label={t({ key: 'POINT_CLOUDS' })}
              modelLayerHandlers={modelLayerHandlers.pointCloudHandlers}
              update={updateCallback}
            />
            <ModelLayerSelection
              label={t({ key: 'IMAGES_360' })}
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
    <SelectPanel
      placement="right"
      appendTo={'parent'}
      hideOnOutsideClick={true}
      openOnHover={!isDisabled}>
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
