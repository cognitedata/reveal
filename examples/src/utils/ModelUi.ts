import * as THREE from 'three';
import {
  AddModelOptions,
  CogniteModel,
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  ViewerState,
  DataSourceType,
  ClassicAddModelOptions
} from '@cognite/reveal';

import * as dat from 'dat.gui';
import { isLocalUrlPointCloudModel } from './isLocalUrlPointCloudModel';

export class ModelUi {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _onModelAdded: (model: CogniteModel<DataSourceType>) => void;

  private readonly _cadModels = new Array<CogniteCadModel>();
  private readonly _pointCloudModels = new Array<CognitePointCloudModel<DataSourceType>>();

  private readonly _guiState: {
    modelId: number;
    revisionId: number;
    geometryFilter: { center: THREE.Vector3; size: THREE.Vector3; enabled: boolean };
    revisionExternalId: string;
    revisionSpace: string;
  };

  private readonly _geometryFilterGui: dat.GUI;

  constructor(
    modelGui: dat.GUI,
    viewer: Cognite3DViewer<DataSourceType>,
    onModelAdded: (model: CogniteModel<DataSourceType>) => void
  ) {
    this._viewer = viewer;
    this._onModelAdded = onModelAdded;

    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const geometryFilterInput = urlParams.get('geometryFilter');
    const geometryFilter = createGeometryFilter(geometryFilterInput);

    this._guiState = {
      modelId: 0,
      revisionId: 0,
      geometryFilter:
        geometryFilter !== undefined
          ? { ...geometryFilter, enabled: true }
          : { center: new THREE.Vector3(), size: new THREE.Vector3(), enabled: false },
      revisionExternalId: '',
      revisionSpace: ''
    };
    const guiActions = {
      removeLastModel: () => {
        viewer.removeModel(this._cadModels[0]);
        this._cadModels.splice(0, 1);
      },
      addModel: () =>
        this.addModel({
          modelId: this._guiState.modelId,
          revisionId: this._guiState.revisionId,
          geometryFilter: this._guiState.geometryFilter.enabled
            ? createGeometryFilterFromState(this._guiState.geometryFilter)
            : undefined,
          revisionExternalId:
            this._guiState.revisionExternalId.length !== 0 ? this._guiState.revisionExternalId : undefined,
          revisionSpace: this._guiState.revisionSpace.length !== 0 ? this._guiState.revisionSpace : undefined
        }),
      fitToModel: () => {
        const model = this._cadModels[0] || this._pointCloudModels[0];
        viewer.fitCameraToModel(model);
      },
      saveModelStateToUrl: () => {
        this.saveModelStateToUrl();
      }
    };

    modelGui.add(this._guiState, 'modelId').name('Model ID');
    modelGui.add(this._guiState, 'revisionId').name('Revision ID');
    modelGui.add(this._guiState, 'revisionExternalId').name('Revision External ID');
    modelGui.add(this._guiState, 'revisionSpace').name('Revision Space');
    modelGui.add(guiActions, 'addModel').name('Load model');
    modelGui.add(guiActions, 'removeLastModel').name('Remove last model');
    modelGui.add(guiActions, 'fitToModel').name('Fit camera');
    modelGui.add(guiActions, 'saveModelStateToUrl').name('Save model state to url');

    this._geometryFilterGui = modelGui.addFolder('Geometry Filter');
    initializeGeometryFilterGui(this._geometryFilterGui, this._viewer, this._guiState.geometryFilter);
  }

  get cadModels(): CogniteCadModel[] {
    return this._cadModels.slice();
  }

  get pointCloudModels(): CognitePointCloudModel<DataSourceType>[] {
    return this._pointCloudModels.slice();
  }

  async restoreModelsFromUrl(): Promise<void> {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;

    // Load model if provided by URL
    await this.restoreModelsFromIds(urlParams);

    const modelState = urlParams.get('modelState');
    if (modelState !== null) {
      await this.restoreModelState(modelState);
    }
  }

  private saveModelStateToUrl() {
    const state = this._viewer.getViewState();
    const modelState = { models: state.models };

    const url = new URL(window.location.href);
    url.searchParams.set('modelState', JSON.stringify(modelState));
    // Update URL without reloading
    window.history.replaceState(null, document.title, url.toString());
  }

  private async restoreModelState(modelState: string) {
    const state = JSON.parse(modelState) as ViewerState;
    this._viewer.setViewState(state);
  }

  private async restoreModelsFromIds(urlParams: URLSearchParams) {
    const modelIdStr = urlParams.get('modelId');
    const revisionIdStr = urlParams.get('revisionId');
    const revisionSpace = urlParams.get('revisionSpace');
    const revisionExternalIdStr = urlParams.get('revisionExternalId');
    const modelUrl = urlParams.get('modelUrl');
    if ((modelIdStr && revisionIdStr) || (revisionSpace && revisionExternalIdStr)) {
      const modelId = modelIdStr !== null ? Number.parseInt(modelIdStr, 10) : undefined;
      const revisionId = revisionIdStr !== null ? Number.parseInt(revisionIdStr, 10) : undefined;
      const revisionExternalId = revisionExternalIdStr ? revisionExternalIdStr : undefined;
      if (modelId !== undefined && revisionId !== undefined) {
        await this.addModel({
          modelId,
          revisionId,
          geometryFilter: createGeometryFilterFromState(this._guiState.geometryFilter)
        });
      } else if (revisionExternalId !== undefined && revisionSpace !== null) {
        await this.addModel({
          geometryFilter: createGeometryFilterFromState(this._guiState.geometryFilter),
          revisionExternalId: revisionExternalId,
          revisionSpace: revisionSpace
        });
      }
    } else if (modelUrl) {
      await this.addModel({
        modelId: -1,
        revisionId: -1,
        localPath: modelUrl,
        geometryFilter: createGeometryFilterFromState(this._guiState.geometryFilter)
      });
    }
  }

  async addModel(options: AddModelOptions<DataSourceType>) {
    try {
      const model =
        options.localPath !== undefined
          ? await addLocalModel(this._viewer, options)
          : await this._viewer.addModel(options);
      if (model instanceof CogniteCadModel) {
        this._cadModels.push(model);
      } else if (model instanceof CognitePointCloudModel) {
        this._pointCloudModels.push(model);
      }

      const bounds = model.getModelBoundingBox();
      if (createGeometryFilterFromState(this._guiState.geometryFilter) === undefined) {
        createGeometryFilterStateFromBounds(bounds, this._guiState.geometryFilter);
        this._geometryFilterGui.updateDisplay();
      }

      this._onModelAdded(model);
    } catch (e) {
      console.error(e);
      alert(`ModelID is invalid, is not supported or you are not authorized (${e})`);
    }
  }
}

async function addLocalModel(
  viewer: Cognite3DViewer<DataSourceType>,
  addModelOptions: AddModelOptions<DataSourceType>
): Promise<CogniteModel<DataSourceType>> {
  const isPointCloud =
    addModelOptions.localPath !== undefined && (await isLocalUrlPointCloudModel(addModelOptions.localPath));
  return isPointCloud ? viewer.addPointCloudModel(addModelOptions) : viewer.addCadModel(addModelOptions);
}

function createGeometryFilterStateFromBounds(bounds: THREE.Box3, out: { center: THREE.Vector3; size: THREE.Vector3 }) {
  bounds.getCenter(out.center);
  bounds.getSize(out.size);
  return out;
}

function createGeometryFilterFromState(state: {
  center: THREE.Vector3;
  size: THREE.Vector3;
}): { boundingBox: THREE.Box3; isBoundingBoxInModelCoordinates: true } | undefined {
  state.size.clamp(new THREE.Vector3(), new THREE.Vector3(Infinity, Infinity, Infinity));
  if (state.size.equals(new THREE.Vector3())) {
    return undefined;
  }
  return {
    boundingBox: new THREE.Box3().setFromCenterAndSize(state.center, state.size),
    isBoundingBoxInModelCoordinates: true
  };
}

function createGeometryFilter(input: string | null): { center: THREE.Vector3; size: THREE.Vector3 } | undefined {
  if (input === null) return undefined;
  const parsed = JSON.parse(input) as { center: THREE.Vector3; size: THREE.Vector3 };
  return { center: new THREE.Vector3().copy(parsed.center), size: new THREE.Vector3().copy(parsed.size) };
}

function initializeGeometryFilterGui(
  uiFolder: dat.GUI,
  viewer: Cognite3DViewer<DataSourceType>,
  geometryFilterState: { center: THREE.Vector3; size: THREE.Vector3; enabled: boolean }
): void {
  let geometryFilterPreview: THREE.Object3D | undefined = undefined;
  const updateGeometryFilterPreview = () => {
    if (geometryFilterPreview) {
      viewer.removeObject3D(geometryFilterPreview);
    }
    const geometryFilter = createGeometryFilterFromState(geometryFilterState);
    if (geometryFilter) {
      geometryFilterPreview = new THREE.Box3Helper(geometryFilter.boundingBox, new THREE.Color('cyan'));
      viewer.addObject3D(geometryFilterPreview);
    }
  };

  const guiActions = {
    applyGeometryFilter: () => {
      const url = new URL(window.location.href);
      url.searchParams.set('geometryFilter', JSON.stringify(geometryFilterState));
      window.location.href = url.toString();
    },
    resetGeometryFilter: () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('geometryFilter');
      window.location.href = url.toString();
    }
  };

  uiFolder.add(geometryFilterState.center, 'x', -1000, 1000, 1).name('CenterX').onChange(updateGeometryFilterPreview);
  uiFolder.add(geometryFilterState.center, 'y', -1000, 1000, 1).name('CenterY').onChange(updateGeometryFilterPreview);
  uiFolder.add(geometryFilterState.center, 'z', -1000, 1000, 1).name('CenterZ').onChange(updateGeometryFilterPreview);
  uiFolder.add(geometryFilterState.size, 'x', 0, 100, 1).name('SizeX').onChange(updateGeometryFilterPreview);
  uiFolder.add(geometryFilterState.size, 'y', 0, 100, 1).name('SizeY').onChange(updateGeometryFilterPreview);
  uiFolder.add(geometryFilterState.size, 'z', 0, 100, 1).name('SizeZ').onChange(updateGeometryFilterPreview);
  uiFolder.add(geometryFilterState, 'enabled').name('Apply to new models?');
  uiFolder.add(guiActions, 'applyGeometryFilter').name('Apply and reload');
  uiFolder.add(guiActions, 'resetGeometryFilter').name('Reset and reload');
}
