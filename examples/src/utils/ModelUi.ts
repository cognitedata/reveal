import {
  AddModelOptions,
  CogniteModel,
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  ViewerState,
  DataSourceType,
} from '@cognite/reveal';

import * as dat from 'dat.gui';
import { isLocalUrlPointCloudModel } from './isLocalUrlPointCloudModel';
import { Vector3, Matrix4, Box3, Object3D, Box3Helper, Color, Quaternion, Euler } from 'three';

export class ModelUi {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _onModelAdded: (model: CogniteModel<DataSourceType>) => void;

  private readonly _cadModels = new Array<CogniteCadModel>();
  private readonly _pointCloudModels = new Array<CognitePointCloudModel<DataSourceType>>();

  private readonly _guiState: {
    modelId: number;
    revisionId: number;
    geometryFilter: { center: Vector3; size: Vector3; enabled: boolean };
    revisionExternalId: string;
    revisionSpace: string;
    transform: {
      position: Vector3;
      rotation: Quaternion;
      scale: Vector3;
    }
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
    const transform = { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1, 1, 1) };

    this._guiState = {
      modelId: 0,
      revisionId: 0,
      geometryFilter:
        geometryFilter !== undefined
          ? { ...geometryFilter, enabled: true }
          : { center: new Vector3(), size: new Vector3(), enabled: false },
      revisionExternalId: '',
      revisionSpace: '',
      transform: transform
    };
    const guiActions = {
      removeLastModel: () => {
        viewer.removeModel(this._cadModels[0]);
        this._cadModels.splice(0, 1);
      },
      addModel: () => {
        const transformMatrix = this.createTransformMatrix(this._guiState.transform);
        this.addModel({
          modelId: this._guiState.modelId,
          revisionId: this._guiState.revisionId,
          geometryFilter: this._guiState.geometryFilter.enabled
            ? createGeometryFilterFromState(this._guiState.geometryFilter)
            : undefined,
          revisionExternalId:
            this._guiState.revisionExternalId.length !== 0 ? this._guiState.revisionExternalId : undefined,
          revisionSpace: this._guiState.revisionSpace.length !== 0 ? this._guiState.revisionSpace : undefined,
        }, transformMatrix);
      },
      fitToModel: () => {
        // const model = this._cadModels[0] || this._pointCloudModels[0];
        // viewer.fitCameraToModel(model);
        viewer.fitCameraToModels(viewer.models);
      },
      saveModelStateToUrl: () => {
        this.saveModelStateToUrl();
      },
      applyTransformToModels: () => {
        this.applyCurrentTransformToLoadedModels();
      }
    };

    modelGui.add(this._guiState, 'modelId').name('Model ID');
    modelGui.add(this._guiState, 'revisionId').name('Revision ID');
    modelGui.add(this._guiState, 'revisionExternalId').name('Revision External ID');
    modelGui.add(this._guiState, 'revisionSpace').name('Revision Space');

    // Transform controls
    const transformGui = modelGui.addFolder('Transform');
    this.initializeTransformGui(transformGui, this._guiState.transform);

    modelGui.add(guiActions, 'addModel').name('Load model');
    modelGui.add(guiActions, 'removeLastModel').name('Remove last model');
    modelGui.add(guiActions, 'fitToModel').name('Fit camera');
    modelGui.add(guiActions, 'applyTransformToModels').name('Apply transform to loaded models');
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

    // Also save current transform state
    url.searchParams.set('transform', JSON.stringify({
      position: this._guiState.transform.position,
      rotation: this._guiState.transform.rotation,
      scale: this._guiState.transform.scale
    }));

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

    // Get transform from URL if provided
    const transformStr = urlParams.get('transform');
    let transformMatrix: Matrix4 | undefined;
    if (transformStr) {
      try {
        const transformData = JSON.parse(transformStr);
        if (transformData.position && transformData.rotation && transformData.scale) {
          // Update the GUI state with URL transform data
          this._guiState.transform.position.copy(transformData.position);
          this._guiState.transform.rotation.copy(transformData.rotation);
          this._guiState.transform.scale.copy(transformData.scale);
          transformMatrix = this.createTransformMatrix(this._guiState.transform);
        }
      } catch (error) {
        console.warn('Failed to parse transform from URL:', error);
      }
    }

    if ((modelIdStr && revisionIdStr) || (revisionSpace && revisionExternalIdStr)) {
      const modelId = modelIdStr !== null ? Number.parseInt(modelIdStr, 10) : undefined;
      const revisionId = revisionIdStr !== null ? Number.parseInt(revisionIdStr, 10) : undefined;
      if (modelId !== undefined && revisionId !== undefined) {
        await this.addModel({
          modelId,
          revisionId,
          geometryFilter: createGeometryFilterFromState(this._guiState.geometryFilter)
        }, transformMatrix);
      } else if (revisionExternalIdStr !== null && revisionSpace !== null) {
        await this.addModel({
          geometryFilter: createGeometryFilterFromState(this._guiState.geometryFilter),
          revisionExternalId: revisionExternalIdStr,
          revisionSpace: revisionSpace
        }, transformMatrix);
      }
    } else if (modelUrl) {
      await this.addModel({
        modelId: -1,
        revisionId: -1,
        localPath: modelUrl,
        geometryFilter: createGeometryFilterFromState(this._guiState.geometryFilter)
      }, transformMatrix);
    }
  }

  async addModel(options: AddModelOptions<DataSourceType>, transform?: Matrix4) {
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
      if (transform) {
        model.setModelTransformation(transform);
      }

      this._onModelAdded(model);
    } catch (e) {
      console.error(e);
      alert(`ModelID is invalid, is not supported or you are not authorized (${e})`);
    }
  }

  private createTransformMatrix(transform: { position: Vector3; rotation: Quaternion; scale: Vector3 }): Matrix4 {
    const matrix = new Matrix4();
    matrix.compose(transform.position, transform.rotation, transform.scale);
    return matrix;
  }

  private applyCurrentTransformToLoadedModels(): void {
    const transformMatrix = this.createTransformMatrix(this._guiState.transform);

    // Apply to all loaded CAD models
    this._cadModels.forEach(model => {
      model.setModelTransformation(transformMatrix);
    });

    // Apply to all loaded point cloud models
    this._pointCloudModels.forEach(model => {
      model.setModelTransformation(transformMatrix);
    });

    console.log('Transform applied to', this._cadModels.length + this._pointCloudModels.length, 'models');
  }

  private initializeTransformGui(transformGui: dat.GUI, transform: { position: Vector3; rotation: Quaternion; scale: Vector3 }): void {
    const positionGui = transformGui.addFolder('Position');
    positionGui.add(transform.position, 'x', -10000, 10000, 0.1).name('X');
    positionGui.add(transform.position, 'y', -10000, 10000, 0.1).name('Y');
    positionGui.add(transform.position, 'z', -10000, 10000, 0.1).name('Z');

    const rotationGui = transformGui.addFolder('Rotation (Euler)');
    const rotationEuler = { x: 0, y: 0, z: 0 };

    // Convert quaternion to euler for GUI display
    const euler = new Euler();
    const updateEulerFromQuaternion = () => {
      euler.setFromQuaternion(transform.rotation, 'XYZ');
      rotationEuler.x = (euler.x * 180) / Math.PI;
      rotationEuler.y = (euler.y * 180) / Math.PI;
      rotationEuler.z = (euler.z * 180) / Math.PI;
    };

    const updateQuaternionFromEuler = () => {
      euler.set(
        (rotationEuler.x * Math.PI) / 180,
        (rotationEuler.y * Math.PI) / 180,
        (rotationEuler.z * Math.PI) / 180,
        'XYZ'
      );
      transform.rotation.setFromEuler(euler);
    };

    updateEulerFromQuaternion();
    rotationGui.add(rotationEuler, 'x', -180, 180, 1).name('X (degrees)').onChange(updateQuaternionFromEuler);
    rotationGui.add(rotationEuler, 'y', -180, 180, 1).name('Y (degrees)').onChange(updateQuaternionFromEuler);
    rotationGui.add(rotationEuler, 'z', -180, 180, 1).name('Z (degrees)').onChange(updateQuaternionFromEuler);

    const scaleGui = transformGui.addFolder('Scale');
    scaleGui.add(transform.scale, 'x', 0.1, 10, 0.1).name('X');
    scaleGui.add(transform.scale, 'y', 0.1, 10, 0.1).name('Y');
    scaleGui.add(transform.scale, 'z', 0.1, 10, 0.1).name('Z');

    const scaleActions = {
      uniformScale: 1.0,
      applyUniformScale: () => {
        transform.scale.setScalar(scaleActions.uniformScale);
        scaleGui.updateDisplay();
      },
      resetTransform: () => {
        transform.position.set(0, 0, 0);
        transform.rotation.set(0, 0, 0, 1);
        transform.scale.set(1, 1, 1);
        rotationEuler.x = rotationEuler.y = rotationEuler.z = 0;
        scaleActions.uniformScale = 1.0;
        transformGui.updateDisplay();
      }
    };

    scaleGui.add(scaleActions, 'uniformScale', 0.1, 10, 0.1).name('Uniform Scale');
    scaleGui.add(scaleActions, 'applyUniformScale').name('Apply Uniform Scale');
    transformGui.add(scaleActions, 'resetTransform').name('Reset Transform');
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

function createGeometryFilterStateFromBounds(bounds: Box3, out: { center: Vector3; size: Vector3 }) {
  bounds.getCenter(out.center);
  bounds.getSize(out.size);
  return out;
}

function createGeometryFilterFromState(state: {
  center: Vector3;
  size: Vector3;
}): { boundingBox: Box3; isBoundingBoxInModelCoordinates: true } | undefined {
  state.size.clamp(new Vector3(), new Vector3(Infinity, Infinity, Infinity));
  if (state.size.equals(new Vector3())) {
    return undefined;
  }
  return {
    boundingBox: new Box3().setFromCenterAndSize(state.center, state.size),
    isBoundingBoxInModelCoordinates: true
  };
}

function createGeometryFilter(input: string | null): { center: Vector3; size: Vector3 } | undefined {
  if (input === null) return undefined;
  const parsed = JSON.parse(input) as { center: Vector3; size: Vector3 };
  return { center: new Vector3().copy(parsed.center), size: new Vector3().copy(parsed.size) };
}

function initializeGeometryFilterGui(
  uiFolder: dat.GUI,
  viewer: Cognite3DViewer<DataSourceType>,
  geometryFilterState: { center: Vector3; size: Vector3; enabled: boolean }
): void {
  let geometryFilterPreview: Object3D | undefined = undefined;
  const updateGeometryFilterPreview = () => {
    if (geometryFilterPreview) {
      viewer.removeObject3D(geometryFilterPreview);
    }
    const geometryFilter = createGeometryFilterFromState(geometryFilterState);
    if (geometryFilter) {
      geometryFilterPreview = new Box3Helper(geometryFilter.boundingBox, new Color('cyan'));
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
