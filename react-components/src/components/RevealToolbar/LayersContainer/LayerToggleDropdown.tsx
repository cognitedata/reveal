/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Menu } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { ModelLayersList } from './ModelLayersList';
import { WholeLayerVisibilityToggle } from './WholeLayerVisibilityToggle';
import { withSuppressRevealEvents } from '../../../higher-order-components/withSuppressRevealEvents';
import { type UpdateModelHandlersCallback } from './useModelHandlers';

const SuppressedSubmenu = withSuppressRevealEvents(Menu.Submenu);

export const LayerToggleDropdown = ({
  layerHandlers,
  update,
  label
}: {
  layerHandlers: ModelHandler[];
  update: UpdateModelHandlersCallback;
  label: string;
}): ReactElement => {
  return (
    <SuppressedSubmenu
      appendTo={'parent'}
      content={<ModelLayersList modelHandlers={layerHandlers} update={update} />}>
      <WholeLayerVisibilityToggle modelHandlers={layerHandlers} update={update} label={label} />
    </SuppressedSubmenu>
  );
};
