/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CogniteCadModel } from '@reveal/cad-model';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import {
  fromSerializableNodeAppearance,
  NodeCollectionDeserializer,
  toSerializableNodeAppearance
} from '@reveal/cad-styling';

import { CameraManager } from '@reveal/camera-manager';

import { CogniteClient } from '@cognite/sdk';
import { SerializableNodeAppearance } from '@reveal/cad-styling/src/NodeAppearance';

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
  defaultNodeAppearance: SerializableNodeAppearance;
  modelId: number;
  revisionId: number;
  styledSets: { token: string; state: any; options?: any; appearance: SerializableNodeAppearance }[];
};

export class ViewStateHelper {
  private readonly _viewer: Cognite3DViewer;
  private readonly _cdfClient: CogniteClient;
  private get _cameraManager(): CameraManager {
    return this._viewer.cameraManager;
  }

  constructor(viewer: Cognite3DViewer, cdfClient: CogniteClient) {
    this._viewer = viewer;
    this._cdfClient = cdfClient;
  }

  public getCurrentState(): ViewerState {
    const { position: cameraPosition, target: cameraTarget } = this._cameraManager.getCameraState();
    const modelStates = this.getModelsState();
    const clippingPlanesState = this.getClippingPlanesState();

    return {
      camera: {
        position: {
          x: cameraPosition.x,
          y: cameraPosition.y,
          z: cameraPosition.z
        },
        target: {
          x: cameraTarget.x,
          y: cameraTarget.y,
          z: cameraTarget.z
        }
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
      .filter(model => model instanceof CogniteCadModel)
      .map(model => model as CogniteCadModel)
      .map(model => {
        const defaultNodeAppearance = toSerializableNodeAppearance(model.getDefaultNodeAppearance());
        const modelId = model.modelId;
        const revisionId = model.revisionId;

        const styledCollections = model.styledNodeCollections.map(styledNodeCollection => {
          const { nodeCollection, appearance } = styledNodeCollection;
          return { ...nodeCollection.serialize(), appearance: toSerializableNodeAppearance(appearance) };
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
      .getGlobalClippingPlanes()
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
      .filter(model => model instanceof CogniteCadModel)
      .map(model => model as CogniteCadModel);

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
          model.setDefaultNodeAppearance(fromSerializableNodeAppearance(state.defaultNodeAppearance));

          await Promise.all(
            state.styledSets.map(async styleFilter => {
              const nodeCollection = await NodeCollectionDeserializer.Instance.deserialize(this._cdfClient, model, {
                token: styleFilter.token,
                state: styleFilter.state,
                options: styleFilter.options
              });

              model.assignStyledNodeCollection(nodeCollection, fromSerializableNodeAppearance(styleFilter.appearance));
            })
          );
        })
    );
  }

  private setClippingPlanesState(clippingPlanes: ClippingPlanesState[]) {
    const planes = clippingPlanes.map(p => new THREE.Plane().setComponents(p.nx, p.ny, p.nz, p.constant));
    this._viewer.setGlobalClippingPlanes(planes);
  }
}
