/*!
 * Copyright 2023 Cognite AS
 */
import type React from 'react';
import {
  type CogniteCadModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';

export type Reveal3DResourcesLayerStates = {
  cadLayerData: Array<{
    model: CogniteCadModel;
    isToggled: boolean;
    name?: string | undefined;
  }>;
  pointCloudLayerData: Array<{
    model: CognitePointCloudModel;
    isToggled: boolean;
    name?: string | undefined;
  }>;
  image360LayerData: Array<{
    image360: Image360Collection;
    isToggled: boolean;
  }>;
};

export type SetReveal3DResourcesLayerStates = React.Dispatch<
  React.SetStateAction<Reveal3DResourcesLayerStates>
>;

export type Reveal3DResourcesLayersProps = {
  reveal3DResourcesLayerData: Reveal3DResourcesLayerStates;
  setReveal3DResourcesLayerData: SetReveal3DResourcesLayerStates;
};
