import { type Dispatch, type SetStateAction, type ReactElement, useState } from 'react';
import { SelectPanel } from '@cognite/cogs-lab';
import { Button, LayersIcon, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../../constants';
import { LabelWithShortcut } from '../../Architecture/LabelWithShortcut';
import { useLayersButtonViewModel } from './LayersButton.viewmodel';
import { type LayersUrlStateParam } from './types';

export type LayersButtonProps = {
  layersState?: LayersUrlStateParam | undefined;
  setLayersState?: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined;
};

export const LayersButton = ({
  layersState: externalLayersState,
  setLayersState: setExternalLayersState
}: LayersButtonProps): ReactElement => {
  const { t } = useTranslation();

  const [layersActive, setLayersActive] = useState<boolean>(false);

  const { modelLayerHandlers, updateCallback, ModelLayerSelection } = useLayersButtonViewModel(
    setExternalLayersState,
    externalLayersState
  );

  return (
    <>
      <SelectPanel
        placement="right"
        hideOnOutsideClick
        offset={TOOLBAR_HORIZONTAL_PANEL_OFFSET}
        visible={layersActive}
        onShow={() => {
          setLayersActive(true);
        }}
        onHide={() => {
          setLayersActive(false);
        }}>
        <SelectPanel.Trigger>
          <Tooltip
            content={<LabelWithShortcut label={t({ key: 'LAYERS_FILTER_TOOLTIP' })} />}
            placement="right">
            <Button
              icon={<LayersIcon />}
              type="ghost"
              toggled={layersActive}
              aria-label={t({ key: 'LAYERS_FILTER_TOOLTIP' })}
            />
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
