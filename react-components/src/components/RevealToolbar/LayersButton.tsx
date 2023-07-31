/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { type Reveal3DResourcesStates, type LayerStates } from './LayersContainer/types';
import LayersContainer from './LayersContainer/LayersContainer';
import {
  type CognitePointCloudModel,
  type CogniteCadModel,
  type Image360Collection,
  type CogniteModel
} from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { use3DModelName } from '../../hooks/use3DModelName';
import isEqual from 'lodash/isEqual';

export const LayersButton = (): ReactElement => {
  const layerStatesInitialState: LayerStates = {
    allCadModelVisible: true,
    cadIndeterminate: false,
    allPointCloudModelVisible: true,
    pointCloudIndeterminate: false,
    allImages360Visible: true,
    image360Indeterminate: false,
    layersEnabled: false
  };
  const viewer = useReveal();
  const [layerStates, setLayerStates] = useState<LayerStates>(layerStatesInitialState);

  const [selectedCadModels] = useState<
    Array<{ model: CogniteCadModel; isToggled: boolean; name?: string }>
  >([]);
  const [selectedPointCloudModels] = useState<
    Array<{ model: CognitePointCloudModel; isToggled: boolean; name?: string }>
  >([]);
  const [selectedImage360Collection] = useState<
    Array<{ image360: Image360Collection; isToggled: boolean }>
  >([]);

  const [cadModelIds, setCadModelIds] = useState<number[]>([]);
  const [pointCloudModelIds, setPointCloudModelIds] = useState<number[]>([]);
  const prevModelsRef = useRef<CogniteModel[]>([]);

  const [reveal3DResources, setReveal3DResources] = useState<Reveal3DResourcesStates>({
    cadModels: selectedCadModels,
    pointCloudModels: selectedPointCloudModels,
    image360Collections: selectedImage360Collection
  });

  const showLayers = (): void => {
    setLayerStates((prevLayerStates) => ({
      ...prevLayerStates,
      layersEnabled: !prevLayerStates.layersEnabled
    }));
  };

  useEffect(() => {
    const currentModels = viewer.models;
    // Compare the previous and current models to avoid infinite loop
    if (prevModelsRef.current !== currentModels) {
      prevModelsRef.current = currentModels;
      const cadIds = currentModels
        .filter((model) => model.type === 'cad')
        .map((model) => model.modelId);
      const pointCloudIds = currentModels
        .filter((model) => model.type === 'pointcloud')
        .map((model) => model.modelId);

      // Only update the state when the modelIds change
      if (!isEqual(cadModelIds, cadIds)) {
        setCadModelIds(cadIds);
      }

      if (!isEqual(pointCloudModelIds, pointCloudIds)) {
        setPointCloudModelIds(pointCloudIds);
      }
    }
  }, [viewer.models, cadModelIds, pointCloudModelIds]);

  const cadModelName = use3DModelName(cadModelIds);
  const pointCloudModelName = use3DModelName(pointCloudModelIds);

  const updatedReveal3DResources: Reveal3DResourcesStates = useMemo(() => {
    if (cadModelName.data === null && pointCloudModelName.data === null) {
      return {
        cadModels: [],
        pointCloudModels: [],
        image360Collections: []
      };
    }
    const cadModels = viewer.models.filter((model) => model.type === 'cad');
    const pointCloudModels = viewer.models.filter((model) => model.type === 'pointcloud');
    const image360Collections = viewer.get360ImageCollections();

    const updatedSelectedCadModels = cadModels.map((model, index) => ({
      model: model as CogniteCadModel,
      isToggled: (model as CogniteCadModel).visible ?? true,
      name: cadModelName?.data?.[index] ?? 'No model name'
    }));

    const updatedSelectedPointCloudModel = pointCloudModels.map((model, index) => ({
      model: model as CognitePointCloudModel,
      isToggled: (model as CognitePointCloudModel).getDefaultPointCloudAppearance().visible ?? true,
      name: pointCloudModelName?.data?.[index] ?? 'No model name'
    }));

    const updatedSelectedImage360Collection = image360Collections.map((image360Collection) => ({
      image360: image360Collection,
      isToggled: true
    }));

    return {
      cadModels: updatedSelectedCadModels,
      pointCloudModels: updatedSelectedPointCloudModel,
      image360Collections: updatedSelectedImage360Collection
    };
  }, [
    viewer.models.length,
    viewer.get360ImageCollections().length,
    cadModelName.data,
    pointCloudModelName.data
  ]);

  useEffect(() => {
    setReveal3DResources(updatedReveal3DResources);
  }, [updatedReveal3DResources]);

  return (
    <Dropdown
      appendTo={document.body}
      content={
        <LayersContainer
          layerStates={layerStates}
          setLayerStates={setLayerStates}
          reveal3DResources={reveal3DResources}
          setReveal3DResources={setReveal3DResources}
        />
      }
      visible={layerStates.layersEnabled}
      placement="auto">
      <Button
        type="ghost"
        toggled={layerStates.layersEnabled}
        icon="Layers"
        aria-label="3D Resource layers"
        onClick={showLayers}
      />
    </Dropdown>
  );
};
