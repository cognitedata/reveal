/*!
 * Copyright 2024 Cognite AS
 */

import { type Dispatch, type SetStateAction, type ReactElement } from 'react';
import { SelectPanel } from '@cognite/cogs-lab';
import { Button, LayersIcon, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../../constants';
import { LabelWithShortcut } from '../../Architecture/LabelWithShortcut';
import { useLayersButtonViewModel } from './useLayersButtonViewModel';
import { useSignalValue } from '@cognite/signals/react';
import { type LayersUrlStateParam, type DefaultLayersConfiguration } from './types';

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
  const { modelLayerHandlers, updateCallback, ModelLayerSelection } = useLayersButtonViewModel(
    setExternalLayersState,
    defaultLayerConfiguration,
    externalLayersState
  );

  const modelLayerHandlersValue = useSignalValue(modelLayerHandlers);
  const updateCallbackValue = useSignalValue(updateCallback);

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
            <Button icon={<LayersIcon />} type="ghost" />
          </Tooltip>
        </SelectPanel.Trigger>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label={t({ key: 'CAD_MODELS' })}
              modelLayerHandlers={modelLayerHandlersValue.cadHandlers}
              update={updateCallbackValue}
            />
            <ModelLayerSelection
              label={t({ key: 'POINT_CLOUDS' })}
              modelLayerHandlers={modelLayerHandlersValue.pointCloudHandlers}
              update={updateCallbackValue}
            />
            <ModelLayerSelection
              label={t({ key: 'IMAGES_360' })}
              modelLayerHandlers={modelLayerHandlersValue.image360Handlers}
              update={updateCallbackValue}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    </>
  );
};
