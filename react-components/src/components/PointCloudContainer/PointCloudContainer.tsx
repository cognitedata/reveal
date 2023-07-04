/*!
 * Copyright 2023 Cognite AS
 */

import { type CognitePointCloudModel, type AddModelOptions } from '@cognite/reveal';
import { useEffect, useRef, type ReactElement } from 'react';
import { type Matrix4 } from 'three';
import { useReveal } from '../RevealContainer/RevealContext';

type Cognite3dModelProps = {
  addModelOptions: AddModelOptions;
  transform?: Matrix4;
  onLoad?: () => void;
};

export function PointCloudContainer({
  addModelOptions,
  transform,
  onLoad
}: Cognite3dModelProps): ReactElement {
  const modelRef = useRef<CognitePointCloudModel>();
  const viewer = useReveal();
  const { modelId, revisionId } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform).catch(console.error);
    return removeModel;
  }, [modelId, revisionId]);

  useEffect(() => {
    if (modelRef.current === undefined || transform === undefined) return;
    modelRef.current.setModelTransformation(transform);
  }, [transform]);

  return <></>;

  async function addModel(modelId: number, revisionId: number, transform?: Matrix4): Promise<void> {
    const pointCloudModel = await viewer.addPointCloudModel({ modelId, revisionId });
    if (transform !== undefined) {
      pointCloudModel.setModelTransformation(transform);
    }
    modelRef.current = pointCloudModel;
    onLoad?.();
  }

  function removeModel(): void {
    if (modelRef.current === undefined || !viewer.models.includes(modelRef.current)) return;
    viewer.removeModel(modelRef.current);
    modelRef.current = undefined;
  }
}
