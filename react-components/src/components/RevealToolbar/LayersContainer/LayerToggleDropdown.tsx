/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Menu } from '@cognite/cogs-lab';
import { type ModelHandler } from './ModelHandler';
import { ModelLayersList } from './ModelLayersList';
import { WholeLayerVisibilityToggle } from './WholeLayerVisibilityToggle';
import { withSuppressRevealEvents } from '../../../higher-order-components/withSuppressRevealEvents';
import { type UpdateModelHandlersCallback } from './useModelHandlers';

const SuppressedSubmenu = Menu;

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
      label={label}
      renderTrigger={(props: any) => (
        <WholeLayerVisibilityToggle
          {...props}
          modelHandlers={layerHandlers}
          update={update}
          label={label}
        />
      )}>
      <ModelLayersList modelHandlers={layerHandlers} update={update} />
    </SuppressedSubmenu>
  );
};
