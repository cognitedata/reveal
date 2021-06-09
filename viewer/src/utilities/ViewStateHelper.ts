/*!
 * Copyright 2021 Cognite AS
 */

import { NumericRange } from '.';
import ComboControls from '../combo-camera-controls';
import { NodeAppearance } from '../datamodels/cad/NodeAppearance';
import { ByAssetNodeSet, ByNodePropertyNodeSet, ByTreeIndexNodeSet, NodeSet } from '../datamodels/cad/styling';
import { ExecutesFilter } from '../datamodels/cad/styling/ExecutesFilter';
import { Cognite3DModel } from '../public/migration/Cognite3DModel';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { CogniteClient } from '@cognite/sdk';
import { ByNodePropertyNodeSetOptions } from '../datamodels/cad/styling/ByNodePropertyNodeSet';
import * as THREE from 'three';
import { IndexSet } from './indexset/IndexSet';

export type ViewerState = {
  cameraTarget: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  models: ModelState[];
};

export type ModelState = {
  defaultNodeAppearance: NodeAppearance;
  modelId: number;
  revisionId: number;
  styledFilters: { typeToken: string; filter: any; appearance: NodeAppearance }[];
  styledIndices: { indexRanges: NumericRange[]; appearance: NodeAppearance }[];
};

export class ViewStateHelper {
  private readonly _cameraControls: ComboControls;
  private readonly _viewer: Cognite3DViewer;
  private _client: CogniteClient;
  private _map = new Map<
    string,
    (client: CogniteClient, model: Cognite3DModel, options?: any) => NodeSet & ExecutesFilter
  >();

  constructor(viewer: Cognite3DViewer, client: CogniteClient) {
    this._viewer = viewer;
    this._client = client;
    this._cameraControls = viewer.cameraControls;
    this.registerNodeSets();
  }

  private registerNodeSets() {
    this._map.set(
      ByNodePropertyNodeSet.name,
      (client: CogniteClient, model: Cognite3DModel, options?: ByNodePropertyNodeSetOptions) =>
        new ByNodePropertyNodeSet(client, model, options)
    );

    this._map.set(
      ByAssetNodeSet.name,
      (client: CogniteClient, model: Cognite3DModel) => new ByAssetNodeSet(client, model)
    );
  }

  public getCurrentState(): ViewerState {
    const cameraState = this._cameraControls.getState();

    (this._viewer.models[0] as Cognite3DModel).styleNodeSets;

    const modelStates = this._viewer.models
      .filter(model => model instanceof Cognite3DModel)
      .map(model => model as Cognite3DModel)
      .map(model => {
        const defaultNodeAppearance = model.getDefaultNodeAppearance();
        const modelId = model.modelId;
        const revisionId = model.revisionId;

        const filteredStyledNodeSets: { typeToken: string; filter: any; appearance: NodeAppearance }[] = [];
        const indexedStyledNodeSets: { indexRanges: NumericRange[]; appearance: NodeAppearance }[] = [];

        for (let i = 0; i < model.styleNodeSets.length; i++) {
          const { nodes, appearance } = model.styleNodeSets[i];
          if (isExecutesFilter(nodes)) {
            filteredStyledNodeSets.push({ typeToken: nodes.classToken, filter: nodes.getFilter(), appearance });
          } else {
            indexedStyledNodeSets.push({ indexRanges: nodes.getIndexSet().ranges(), appearance: appearance });
          }
        }

        return {
          defaultNodeAppearance: defaultNodeAppearance,
          modelId,
          revisionId,
          styledFilters: filteredStyledNodeSets,
          styledIndices: indexedStyledNodeSets
        } as ModelState;
      });

    return {
      cameraPosition: cameraState.position,
      cameraTarget: cameraState.target,
      models: modelStates
    };

    function isExecutesFilter(nodeSet: any): nodeSet is ExecutesFilter {
      return (
        (nodeSet as ExecutesFilter).executeFilter !== undefined && (nodeSet as ExecutesFilter).getFilter !== undefined
      );
    }
  }

  public setState(viewerState: ViewerState): void {
    const cameraPosition = new THREE.Vector3(
      viewerState.cameraPosition.x,
      viewerState.cameraPosition.y,
      viewerState.cameraPosition.z
    );

    const cameraTarget = new THREE.Vector3(
      viewerState.cameraTarget.x,
      viewerState.cameraTarget.y,
      viewerState.cameraTarget.z
    );
    this._cameraControls.setState(cameraPosition, cameraTarget);

    const cadModels = this._viewer.models
      .filter(model => model instanceof Cognite3DModel)
      .map(p => p as Cognite3DModel);

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
      .forEach(modelState => {
        const { model, state } = modelState;
        model.setDefaultNodeAppearance(state.defaultNodeAppearance);

        state.styledFilters.forEach(styleFilter => {
          const nodeSetTypeConstructor = this._map.get(styleFilter.typeToken)!;
          const nodeSetInstance = nodeSetTypeConstructor(this._client, model);
          nodeSetInstance.executeFilter(styleFilter.filter);
          model.addStyledNodeSet(nodeSetInstance, styleFilter.appearance);
        });

        state.styledIndices.forEach(styledIndices => {
          const indexSet = new IndexSet();
          styledIndices.indexRanges.forEach(range => indexSet.addRange(new NumericRange(range.from, range.count)));
          const treeIndexStyleSet = new ByTreeIndexNodeSet(indexSet);
          model.addStyledNodeSet(treeIndexStyleSet, styledIndices.appearance);
        });
      });
  }
}
