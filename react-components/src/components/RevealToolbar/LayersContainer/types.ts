/*!
 * Copyright 2023 Cognite AS
 */
import type React from 'react';
import {
  type CogniteCadModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';

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

export type SetReveal3DResourcesStates = React.Dispatch<
  React.SetStateAction<Reveal3DResourcesStates>
>;

export type Reveal3DResourcesLayersProps = {
  reveal3DResourcesStates: Reveal3DResourcesStates;
  setReveal3DResourcesStates: SetReveal3DResourcesStates;
};
