/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DModel, Cognite3DViewer, DefaultNodeAppearance } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

/**
 * Regression issue where ghosting one model made the other invisible (ACEPC-110).
 */
function TwoModelsOneGhostedPage() {
  function handleModelAdded(model: Cognite3DModel, modelIndex: number) {
    if (modelIndex === 0) {
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      const translation = new THREE.Matrix4().makeTranslation(0, 0, 5);
      const transform = model.getModelTransformation();
      transform.multiply(translation);
      model.setModelTransformation(transform);
    } 
  }

  return (
    <Cognite3DTestViewer 
      modelUrls={['primitives', 'primitives']}
      cadModelAddedCallback={handleModelAdded}
      initializeCallback={(viewer:Cognite3DViewer) => {
        viewer.cameraManager.setCameraState({position: new THREE.Vector3(30,10,50), 
          target: new THREE.Vector3()});
      }} />
  );
}
registerVisualTest('cad', 'two-models-one-ghosted', 'Two models, one is ghosted', <TwoModelsOneGhostedPage />)
