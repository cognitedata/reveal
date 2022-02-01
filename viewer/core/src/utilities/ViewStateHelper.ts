/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { Cognite3DModel } from '../public/migration/Cognite3DModel';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';

import { RevealCameraControls } from '@reveal/camera-manager';
import { NodeAppearance } from '@reveal/cad-styling';

import { CogniteClient } from '@cognite/sdk';
import { NodeCollectionDeserializer } from '@reveal/core';

export type ViewerState = {
  camera?: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
  models?: ModelState[];
};

export type ModelState = {
  defaultNodeAppearance: NodeAppearance;
  modelId: number;
  revisionId: number;
  styledSets: { token: string; state: any; options?: any; appearance: NodeAppearance }[];
};

export class ViewStateHelper {
  private readonly _cameraControls: RevealCameraControls;
  private readonly _viewer: Cognite3DViewer;
  private readonly _cdfClient: CogniteClient;

  constructor(viewer: Cognite3DViewer, cdfClient: CogniteClient) {
    this._viewer = viewer;
    this._cdfClient = cdfClient;
    this._cameraControls = viewer.cameraControls;
  }

  public getCurrentState(): ViewerState {
    const cameraState = this._cameraControls.getState();

    const modelStates = this._viewer.models
      .filter(model => model instanceof Cognite3DModel)
      .map(model => model as Cognite3DModel)
      .map(model => {
        const defaultNodeAppearance = model.getDefaultNodeAppearance();
        const modelId = model.modelId;
        const revisionId = model.revisionId;

        const styledCollections = model.styledNodeCollections.map(styledNodeCollection => {
          const { nodeCollection, appearance } = styledNodeCollection;
          return { ...nodeCollection.serialize(), appearance: appearance };
        });

        return {
          defaultNodeAppearance: defaultNodeAppearance,
          modelId,
          revisionId,
          styledSets: styledCollections
        } as ModelState;
      });

    return {
      camera: {
        position: cameraState.position,
        target: cameraState.target
      },
      models: modelStates
    };
  }

  public async setState(viewerState: ViewerState): Promise<void> {
    if (viewerState.camera !== undefined) {
      this.setCameraFromState(viewerState.camera);
    }
    if (viewerState.models !== undefined) {
      this.setModelState(viewerState.models);
    }
  }

  private setCameraFromState(cameraState: Exclude<ViewerState['camera'], undefined>) {
    const camPos = cameraState.position;
    const camTarget = cameraState.target;
    this._cameraControls.setState(
      new THREE.Vector3(camPos.x, camPos.y, camPos.z),
      new THREE.Vector3(camTarget.x, camTarget.y, camTarget.z)
    );
  }

  private async setModelState(modelsState: Exclude<ViewerState['models'], undefined>) {
    const cadModels = this._viewer.models
      .filter(model => model instanceof Cognite3DModel)
      .map(model => model as Cognite3DModel);

    await Promise.all(
      modelsState
        .map(state => {
          const model = cadModels.find(model => model.modelId == state.modelId && model.revisionId == state.revisionId);
          if (model === undefined) {
            throw new Error(
              `Cannot apply model state. Model (modelId: ${state.modelId}, revisionId: ${state.revisionId}) has not been added to viewer.`
            );
          }

          return { model: model, state: state };
        })
        .map(async modelState => {
          const { model, state } = modelState;
          model.setDefaultNodeAppearance(state.defaultNodeAppearance);

          await Promise.all(
            state.styledSets.map(async styleFilter => {
              const nodeCollection = await NodeCollectionDeserializer.Instance.deserialize(this._cdfClient, model, {
                token: styleFilter.token,
                state: styleFilter.state,
                options: styleFilter.options
              });

              model.assignStyledNodeCollection(nodeCollection, styleFilter.appearance);
            })
          );
        })
    );
  }
}
