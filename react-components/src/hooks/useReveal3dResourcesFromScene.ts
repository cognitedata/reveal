/*!
 * Copyright 2023 Cognite AS
 */

import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { type CogniteClient } from '@cognite/sdk';
import {
  type AddResourceOptions,
  type AddImageCollection360DatamodelsOptions
} from '../components/Reveal3DResources/types';
import { CDF_TO_VIEWER_TRANSFORMATION, type AddModelOptions } from '@cognite/reveal';
import { useEffect, useState } from 'react';

export type UseSyncSceneConfigWithViewerProps = {
  sdk: CogniteClient;
  sceneExternalId: string;
  sceneSpaceId: string;
};

export const useReveal3dResourcesFromScene = (
  sceneExternalId: string,
  sceneSpaceId: string
): AddResourceOptions[] => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const [resourceOptions, setResourceOptions] = useState<AddResourceOptions[]>([]);

  useEffect(() => {
    if (scene.data !== undefined) {
      const addResourceOptions: AddResourceOptions[] = [];
      scene.data.sceneModels.forEach((model) => {
        if (isNaN(model.modelId)) {
          throw new Error('Model id is not a number');
        }

        const addModelOptions: AddModelOptions = {
          modelId: model.modelId,
          revisionId: model.revisionId
        };

        const transform = new THREE.Matrix4();

        // Default to 1 in scale if scale is set to 0
        if (model.scaleX === 0) model.scaleX = 1;
        if (model.scaleY === 0) model.scaleY = 1;
        if (model.scaleZ === 0) model.scaleZ = 1;

        transform.makeRotationFromEuler(
          new THREE.Euler(
            THREE.MathUtils.degToRad(model.eulerRotationX),
            THREE.MathUtils.degToRad(model.eulerRotationY),
            THREE.MathUtils.degToRad(model.eulerRotationZ),
            'XYZ'
          )
        );

        const scaleMatrix = new THREE.Matrix4().makeScale(model.scaleX, model.scaleY, model.scaleZ);
        transform.multiply(scaleMatrix);

        const translationMatrix = new THREE.Matrix4().makeTranslation(
          model.translationX,
          model.translationY,
          model.translationZ
        );
        transform.premultiply(translationMatrix);

        transform.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

        addResourceOptions.push({ ...addModelOptions, transform });
      });

      scene.data.image360Collections.forEach((collection) => {
        const addModelOptions: AddImageCollection360DatamodelsOptions = {
          externalId: collection.image360CollectionExternalId,
          space: collection.image360CollectionSpace
        };

        const transform = new THREE.Matrix4();
        const scale = new THREE.Matrix4().makeScale(
          collection.scaleX,
          collection.scaleY,
          collection.scaleZ
        );
        const euler = new THREE.Euler(
          collection.eulerRotationX,
          collection.eulerRotationY,
          collection.eulerRotationZ,
          'XYZ'
        );
        const rotation = new THREE.Matrix4().makeRotationFromEuler(euler);
        // Create translation matrix
        const translation = new THREE.Matrix4().makeTranslation(
          collection.translationX,
          collection.translationY,
          collection.translationZ
        );

        // Combine transformations
        transform.multiply(scale).multiply(rotation).multiply(translation);
        addResourceOptions.push({ ...addModelOptions, transform });
      });
      setResourceOptions(addResourceOptions);
    }
  }, [scene.data]);

  return resourceOptions;
};
