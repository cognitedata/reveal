/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { LayersContainer } from './LayersContainer/LayersContainer';
import styled from 'styled-components';

export const LayersButton = (): ReactElement => {
  const [layersEnabled, setLayersEnabled] = useState(false);
  const showLayers = () => {
    setLayersEnabled(!layersEnabled);
  };

  return (
    <LayersButtonContainer>
      <Button
        type="ghost"
        icon="Layers"
        aria-label="3D Resource layers"
        onClick={showLayers} />
        {layersEnabled && <LayersContainer />}
    </LayersButtonContainer>
  );
};

const LayersButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
