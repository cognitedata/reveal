/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { Button, Dropdown, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { type Reveal3DResourcesLayerStates } from './LayersContainer/types';
import LayersContainer from './LayersContainer/LayersContainer';
import {
  type CognitePointCloudModel,
  type CogniteCadModel,
  type CogniteModel,
  type Image360Collection
} from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { use3DModelName } from '../../hooks/use3DModelName';
import { isEqual } from 'lodash';
import { useRevealContainerElement } from '../RevealContainer/RevealContainerElementContext';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export const LayersButton = (): ReactElement => {
  const viewer = useReveal();
  const revealContainerElement = useRevealContainerElement();
  const [visible, setVisible] = useState<boolean>(false);

  const [cadModelIds, setCadModelIds] = useState<number[]>([]);
  const [pointCloudModelIds, setPointCloudModelIds] = useState<number[]>([]);
  const prevModelsRef = useRef<CogniteModel[]>([]);

  const [reveal3DResourcesLayerData, setReveal3DResourcesLayerData] =
    useState<Reveal3DResourcesLayerStates>({
      cadLayerData: [],
      pointCloudLayerData: [],
      image360LayerData: []
    });

  const cadModelName = use3DModelName(cadModelIds);
  const pointCloudModelName = use3DModelName(pointCloudModelIds);

  const showLayers = (): void => {
    setVisible((prevState) => !prevState);
  };

  const handleClickOutside = (): void => {
    setVisible(false);
  };
  const ref = useRef<HTMLButtonElement | null>(null);
  useOutsideClick(ref, handleClickOutside);

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

  const updated3DResourcesLayerData: Reveal3DResourcesLayerStates = useMemo(() => {
    if (cadModelName.data === null && pointCloudModelName.data === null) {
      return {
        cadLayerData: [],
        pointCloudLayerData: [],
        image360LayerData: []
      };
    }
    const updatedCadLayerData = viewer.models
      .filter((model): model is CogniteCadModel => model.type === 'cad')
      .map((model, index) => fillCadLayerData(model, index));
    const updatedPointCloudLayerData = viewer.models
      .filter((model): model is CognitePointCloudModel => model.type === 'pointcloud')
      .map((model, index) => fillPointCloudLayerData(model, index));
    const updatedImage360LayerData = viewer
      .get360ImageCollections()
      .map((image36Collection) => fillImage360LayerData(image36Collection));

    updatedImage360LayerData.forEach((image360LayerData) => {
      subcribe360ImageEnterExitMode(image360LayerData);
    });

    function fillCadLayerData(
      cadModel: CogniteCadModel,
      index: number
    ): { model: CogniteCadModel; isToggled: boolean; name: string } {
      return {
        model: cadModel,
        isToggled: cadModel.visible ?? true,
        name: cadModelName?.data?.[index] ?? 'No model name'
      };
    }

    function fillPointCloudLayerData(
      pointCloudModel: CognitePointCloudModel,
      index: number
    ): { model: CognitePointCloudModel; isToggled: boolean; name: string } {
      return {
        model: pointCloudModel,
        isToggled: pointCloudModel.getDefaultPointCloudAppearance().visible ?? true,
        name: pointCloudModelName?.data?.[index] ?? 'No model name'
      };
    }

    function fillImage360LayerData(image360Collection: Image360Collection): {
      image360: Image360Collection;
      isToggled: boolean;
      isActive: boolean;
    } {
      return {
        image360: image360Collection,
        isToggled: true,
        isActive: false
      };
    }

    function subcribe360ImageEnterExitMode(image360LayerData: {
      image360: Image360Collection;
      isToggled: boolean;
      isActive: boolean;
    }): void {
      image360LayerData.image360.on('image360Entered', () => {
        image360LayerData.isActive = true;
      });
      image360LayerData.image360.on('image360Exited', () => {
        image360LayerData.isActive = false;
      });
    }

    return {
      cadLayerData: updatedCadLayerData,
      pointCloudLayerData: updatedPointCloudLayerData,
      image360LayerData: updatedImage360LayerData
    };
  }, [
    viewer.models.length,
    viewer.get360ImageCollections().length,
    cadModelName.data,
    pointCloudModelName.data
  ]);

  useEffect(() => {
    setReveal3DResourcesLayerData(updated3DResourcesLayerData);
  }, [updated3DResourcesLayerData]);

  return (
    <CogsTooltip content={'Filter 3D resource layers'} placement="right" appendTo={document.body}>
      <Dropdown
        appendTo={revealContainerElement ?? document.body}
        content={
          <LayersContainer
            props={{
              reveal3DResourcesLayerData,
              setReveal3DResourcesLayerData
            }}
          />
        }
        visible={visible}
        placement="right-start">
        <Button
          ref={ref}
          type="ghost"
          icon="Layers"
          aria-label="3D Resource layers"
          onClick={showLayers}
          toggled={visible}
        />
      </Dropdown>
    </CogsTooltip>
  );
};
