/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState } from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { LayersContainer } from './LayersContainer/LayersContainer';

export const LayersButton = (): ReactElement => {
  const [layersEnabled, setLayersEnabled] = useState(false);
  const showLayers = (): void => {
    setLayersEnabled(!layersEnabled);
  };

  return (
    <Dropdown
      appendTo={document.body}
      content={<LayersContainer />}
      visible={layersEnabled}
      placement="auto">
      <Button
        type="ghost"
        toggled={layersEnabled}
        icon="Layers"
        aria-label="3D Resource layers"
        onClick={showLayers}
      />
    </Dropdown>
  );
};
