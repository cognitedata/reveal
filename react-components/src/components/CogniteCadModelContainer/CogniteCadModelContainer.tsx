import { useEffect, useRef, useState } from "react";
import { AddModelOptions, Cognite3DViewer, CogniteCadModel } from '@cognite/reveal';
import { useReveal } from "../RevealContainer/RevealContext";
import { Matrix4 } from "three";

type Cognite3dModelProps = {
  addModelOptions: AddModelOptions;
  transform?: THREE.Matrix4;
}

export default function CogniteCadModelContainer({ addModelOptions, transform }: Cognite3dModelProps) {
  const modelRef = useRef<CogniteCadModel>();
  const viewer = useReveal();
  const { modelId, revisionId } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform)
      .catch(console.error);
    return () => {
      if (modelRef.current === undefined || (viewer as any).isDisposed) return;
      viewer.removeModel(modelRef.current);
      modelRef.current = undefined;
    }
  }, [addModelOptions]);

  if (modelRef.current !== undefined && transform !== undefined) {
    modelRef.current.setModelTransformation(transform);
  }
  return <></>;

  async function addModel(modelId: number, revisionId: number, transform?: Matrix4) {
    const cadModel = await viewer.addCadModel({ modelId, revisionId });
    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    viewer.fitCameraToModel(cadModel);
    modelRef.current = cadModel;
  }
}