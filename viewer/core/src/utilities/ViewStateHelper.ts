/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { Cognite3DModel } from '../../../packages/cad-model/src/Cognite3DModel';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { NodeCollectionDeserializer } from '@reveal/cad-styling';

import { CameraManager } from '@reveal/camera-manager';
import { NodeAppearance } from '@reveal/cad-styling';

import { CogniteClient } from '@cognite/sdk';

export type ViewerState = {
  camera?: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
  models?: ModelState[];
  clippingPlanes?: ClippingPlanesState[];
};

export type ClippingPlanesState = {
  nx: number;
  ny: number;
  nz: number;
  constant: number;
};

export type ModelState = {
  defaultNodeAppearance: NodeAppearance;
  modelId: number;
  revisionId: number;
  styledSets: { token: string; state: any; options?: any; appearance: NodeAppearance }[];
};

export class ViewStateHelper {
  private readonly _cameraManager: CameraManager;
  private readonly _viewer: Cognite3DViewer;
  private readonly _cdfClient: CogniteClient;

  constructor(viewer: Cognite3DViewer, cdfClient: CogniteClient) {
    this._viewer = viewer;
    this._cdfClient = cdfClient;
    this._cameraManager = viewer.cameraManager;
  }

  public getCurrentState(): ViewerState {
    const { position: cameraPosition, target: cameraTarget } = this._cameraManager.getCameraState();
    const modelStates = this.getModelsState();
    const clippingPlanesState = this.getClippingPlanesState();

    return {
      camera: {
        position: cameraPosition,
        target: cameraTarget
      },
      models: modelStates,
      clippingPlanes: clippingPlanesState
    };
  }

  public async setState(viewerState: ViewerState): Promise<void> {
    if (viewerState.camera !== undefined) {
      this.setCameraFromState(viewerState.camera);
    }
    if (viewerState.models !== undefined) {
      this.setModelState(viewerState.models);
    }
    if (viewerState.clippingPlanes !== undefined) {
      this.setClippingPlanesState(viewerState.clippingPlanes);
    }
  }

  private getModelsState(): ModelState[] {
    return this._viewer.models
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
  }

  private getClippingPlanesState(): ClippingPlanesState[] {
    return this._viewer
      .getClippingPlanes()
      .map(p => ({ nx: p.normal.x, ny: p.normal.y, nz: p.normal.z, constant: p.constant }));
  }

  private setCameraFromState(cameraState: Exclude<ViewerState['camera'], undefined>) {
    const camPos = cameraState.position;
    const camTarget = cameraState.target;

    this._cameraManager.setCameraState({
      position: new THREE.Vector3(camPos.x, camPos.y, camPos.z),
      target: new THREE.Vector3(camTarget.x, camTarget.y, camTarget.z)
    });
  }

  private async setModelState(modelsState: ModelState[]) {
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

  private setClippingPlanesState(clippingPlanes: ClippingPlanesState[]) {
    const planes = clippingPlanes.map(p => new THREE.Plane().setComponents(p.nx, p.ny, p.nz, p.constant));
    this._viewer.setClippingPlanes(planes);
  }
}
