/*!
 * Copyright 2023 Cognite AS
 */

import {
  type CogniteCadModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';

export type LayerStates = {
  allCadModelVisible: boolean;
  cadIndeterminate: boolean;
  allPointCloudModelVisible: boolean;
  pointCloudIndeterminate: boolean;
  allImages360Visible: boolean;
  image360Indeterminate: boolean;
  layersEnabled: boolean;
};

export type SetLayerStates = (layerStates: LayerStates) => void;

export type Reveal3DResourcesStates = {
  cadModels: Array<{
    model: CogniteCadModel;
    isToggled: boolean;
    name?: string | undefined;
  }>;
  pointCloudModels: Array<{
    model: CognitePointCloudModel;
    isToggled: boolean;
    name?: string | undefined;
  }>;
  image360Collections: Array<{
    image360: Image360Collection;
    isToggled: boolean;
  }>;
};

export type SetReveal3DResourcesStates = (reveal3DResources: Reveal3DResourcesStates) => void;
