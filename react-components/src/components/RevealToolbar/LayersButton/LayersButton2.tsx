import { type Dispatch, type SetStateAction, type ReactElement, useState } from 'react';
import { SelectPanel } from '@cognite/cogs-lab';
import { Button, LayersIcon, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../../constants';
import { LabelWithShortcut } from '../../Architecture/LabelWithShortcut';
import { useLayersButtonViewModel } from './LayersButton2.viewmodel';
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

  const { modelLayerContent, ModelLayerSelection, renderTarget } = useLayersButtonViewModel(
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
              domainObjects={modelLayerContent.cadModels}
              renderTarget={renderTarget}
            />
            <ModelLayerSelection
              label={t({ key: 'POINT_CLOUDS' })}
              domainObjects={modelLayerContent.pointClouds}
              renderTarget={renderTarget}
            />
            <ModelLayerSelection
              label={t({ key: 'IMAGES_360' })}
              domainObjects={modelLayerContent.image360Collections}
              renderTarget={renderTarget}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    </>
  );
};
