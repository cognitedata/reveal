/*!
 * Copyright 2021 Cognite AS
 */

import ComboControls from '@reveal/camera-manager';
import { NodeAppearance } from '../datamodels/cad/NodeAppearance';

import { Cognite3DModel } from '../public/migration/Cognite3DModel';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';

import * as THREE from 'three';
import { NodeCollectionDeserializer } from '../datamodels/cad/styling/NodeCollectionDeserializer';
import { StorageContext } from '../storage/StorageContext';

export type ViewerState = {
  camera: {
    position: THREE.Vector3;
    target: THREE.Vector3;
  };
  models: ModelState[];
};

export type ModelState = {
  defaultNodeAppearance: NodeAppearance;
  modelId: number;
  revisionId: number;
  styledSets: { token: string; state: any; options?: any; appearance: NodeAppearance }[];
};

export class ViewStateHelper {
  private readonly _cameraControls: ComboControls;
  private readonly _viewer: Cognite3DViewer;
  private readonly _storageContext: StorageContext;

  constructor(viewer: Cognite3DViewer, storageContext: StorageContext) {
    this._viewer = viewer;
    this._storageContext = storageContext;
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
          const { nodes, appearance } = styledNodeCollection;
          return { ...nodes.serialize(), appearance: appearance };
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
    const sdkClient = this._storageContext.getSdkClient();

    const cameraPosition = new THREE.Vector3(
      viewerState.camera.position.x,
      viewerState.camera.position.y,
      viewerState.camera.position.z
    );

    const cameraTarget = new THREE.Vector3(
      viewerState.camera.target.x,
      viewerState.camera.target.y,
      viewerState.camera.target.z
    );
    this._cameraControls.setState(cameraPosition, cameraTarget);

    const cadModels = this._viewer.models
      .filter(model => model instanceof Cognite3DModel)
      .map(model => model as Cognite3DModel);

    await Promise.all(
      viewerState.models
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
              const nodeCollection = await NodeCollectionDeserializer.Instance.deserialize(sdkClient, model, {
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
