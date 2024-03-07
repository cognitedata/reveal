/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Button, Dropdown, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { LayersContainer } from '../RevealToolbar/LayersContainer/LayersContainer';
import { useReveal } from '../RevealCanvas/ViewerContext';

import { useTranslation } from '../i18n/I18n';

import { useSyncExternalLayersState } from '../RevealTopbar/LayersStrip/useSyncExternalLayersState';
import { useModelHandlers } from '../RevealTopbar/LayersStrip/useModelHandlers';

type LayersButtonProps = {
  storeStateInUrl?: boolean;
};

export const LayersButton = ({ storeStateInUrl = true }: LayersButtonProps): ReactElement => {
  const viewer = useReveal();
  const { t } = useTranslation();

  const [modelLayerHandlers, update] = useModelHandlers();

  useSyncExternalLayersState(modelLayerHandlers, undefined, undefined, update);

  return (
    <CogsTooltip
      content={t('LAYERS_FILTER_TOOLTIP', 'Filter 3D resource layers')}
      placement="right"
      appendTo={document.body}>
      <Dropdown
        appendTo={viewer.domElement ?? document.body}
        content={<LayersContainer modelHandlers={modelLayerHandlers} update={update} />}
        placement="right-start">
        <Button type="ghost" icon="Layers" aria-label="3D Resource layers" />
      </Dropdown>
    </CogsTooltip>
  );
};
