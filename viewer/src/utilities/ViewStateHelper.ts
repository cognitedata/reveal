/*!
 * Copyright 2021 Cognite AS
 */

import { NumericRange } from '.';
import ComboControls from '../combo-camera-controls';
import { NodeAppearance } from '../datamodels/cad/NodeAppearance';
import { ExecutesFilter } from '../datamodels/cad/styling/ExecutesFilter';
import { Cognite3DModel } from '../public/migration/Cognite3DModel';
import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';

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

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._cameraControls = viewer.cameraControls;
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
    function isExecutesFilter(nodeSet: any): nodeSet is ExecutesFilter<any> {
      return (
        (nodeSet as ExecutesFilter<any>).executeFilter !== undefined &&
        (nodeSet as ExecutesFilter<any>).getFilter !== undefined
      );
    }
  }

  public setState(viewerState: ViewerState): void {
    this._cameraControls.setState(viewerState.cameraPosition, viewerState.cameraTarget);

    const cadModels = this._viewer.models
      .filter(model => model instanceof Cognite3DModel)
      .map(p => p as Cognite3DModel);

    viewerState.models
      .map(state => {
        const test = cadModels.find(model => model.modelId == state.modelId && model.revisionId == state.revisionId);
        if (test === undefined) {
          throw new Error(
            `Cannot apply model state. Model (modelId: ${state.modelId}, revisionId: ${state.revisionId}) has not been added to viewer.`
          );
        }

        return { model: test, state: state };
      })
      .forEach(p => {
        const { model, state } = p;
        model.setDefaultNodeAppearance(state.defaultNodeAppearance);
      });
  }
}
