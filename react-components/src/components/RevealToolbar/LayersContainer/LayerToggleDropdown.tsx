/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { Menu } from '@cognite/cogs.js';
import { ModelHandler } from '../../RevealTopbar/LayersStrip/ModelHandler';
import { ModelLayersList } from '../../RevealTopbar/LayersStrip/ModelLayersList';
import { WholeLayerVisibilityToggle } from '../../RevealTopbar/LayersStrip/WholeLayerVisibilityToggle';

export const LayerToggleDropdown = ({
  layerHandlers,
  update,
  label
}: {
  layerHandlers: ModelHandler[];
  update: () => void;
  label: string;
}): ReactElement => {
  const viewer = useReveal();

  return (
    <div>
      <Menu.Submenu
        appendTo={viewer.domElement ?? document.body}
        content={<ModelLayersList modelHandlers={layerHandlers} update={update} />}>
        <WholeLayerVisibilityToggle modelHandlers={layerHandlers} update={update} label={label} />
      </Menu.Submenu>
    </div>
  );
};
