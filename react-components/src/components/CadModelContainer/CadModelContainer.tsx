/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Matrix4 } from 'three';

type Cognite3dModelProps = {
  addModelOptions: AddModelOptions;
  transform?: Matrix4;
  onLoad?: () => void;
};

export default function CadModelContainer({
  addModelOptions,
  transform,
  onLoad
}: Cognite3dModelProps): ReactElement {
  const modelRef = useRef<CogniteCadModel>();
  const viewer = useReveal();
  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform, onLoad).catch(console.error);
    return removeModel;
  }, [modelId, revisionId, geometryFilter]);

  useEffect(() => {
    if (modelRef.current === undefined || transform === undefined) return;
    modelRef.current.setModelTransformation(transform);
  }, [transform]);

  return <></>;

  async function addModel(
    modelId: number,
    revisionId: number,
    transform?: Matrix4,
    onLoad?: () => void
  ): Promise<void> {
    const cadModel = await viewer.addCadModel({ modelId, revisionId });
    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    modelRef.current = cadModel;
    onLoad?.();
  }

  function removeModel(): void {
    if (modelRef.current === undefined || !viewer.models.includes(modelRef.current)) return;
    viewer.removeModel(modelRef.current);
    modelRef.current = undefined;
  }
}
