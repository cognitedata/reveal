/*!
 * Copyright 2023 Cognite AS
 */

import { useSceneConfig } from './useSceneConfig';
import { type CogniteClient } from '@cognite/sdk';
import {
  type AddResourceOptions,
  type AddImageCollection360DatamodelsOptions
} from '../components/Reveal3DResources/types';
import { CDF_TO_VIEWER_TRANSFORMATION, type AddModelOptions } from '@cognite/reveal';
import { useEffect, useState } from 'react';
import { type Transformation3d } from './types';
import { Euler, MathUtils, Matrix4 } from 'three';

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
    if (scene.data === undefined) {
      return;
    }
    const addResourceOptions: AddResourceOptions[] = [];
    scene.data.sceneModels.forEach((model) => {
      if (isNaN(model.modelId)) {
        throw new Error('Model id is not a number');
      }

      const addModelOptions: AddModelOptions = {
        modelId: model.modelId,
        revisionId: model.revisionId
      };

      const transform = createResourceTransformation(model);

      addResourceOptions.push({ ...addModelOptions, transform });
    });

    scene.data.image360Collections.forEach((collection) => {
      const addModelOptions: AddImageCollection360DatamodelsOptions = {
        externalId: collection.image360CollectionExternalId,
        space: collection.image360CollectionSpace
      };

      const transform = createResourceTransformation(collection);

      addResourceOptions.push({ ...addModelOptions, transform });
    });
    setResourceOptions(addResourceOptions);
  }, [scene.data]);

  return resourceOptions;
};

function createResourceTransformation(transformationData: Transformation3d): Matrix4 {
  const transform = new Matrix4();

  // Default to 1 in scale if scale is set to 0
  if (transformationData.scaleX === 0) transformationData.scaleX = 1;
  if (transformationData.scaleY === 0) transformationData.scaleY = 1;
  if (transformationData.scaleZ === 0) transformationData.scaleZ = 1;

  transform.makeRotationFromEuler(
    new Euler(
      MathUtils.degToRad(transformationData.eulerRotationX),
      MathUtils.degToRad(transformationData.eulerRotationY),
      MathUtils.degToRad(transformationData.eulerRotationZ),
      'XYZ'
    )
  );

  const scaleMatrix = new Matrix4().makeScale(
    transformationData.scaleX,
    transformationData.scaleY,
    transformationData.scaleZ
  );
  transform.multiply(scaleMatrix);

  const translationMatrix = new Matrix4().makeTranslation(
    transformationData.translationX,
    transformationData.translationY,
    transformationData.translationZ
  );
  transform.premultiply(translationMatrix);

  transform.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

  return transform;
}
