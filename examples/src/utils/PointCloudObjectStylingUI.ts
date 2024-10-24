/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import {
  Cognite3DViewer,
  CognitePointCloudModel,
  AnnotationIdPointCloudObjectCollection,
  PointCloudAppearance,
  DefaultPointCloudAppearance,
  PointCloudDMVolumeCollection,
  isDMPointCloudDataType,
  isClassicPointCloudDataType,
  DataSourceType
} from '@cognite/reveal';
import { AnnotationModel, AnnotationsBoundingVolume, AnnotationType, CogniteClient } from '@cognite/sdk';

export class PointCloudObjectStylingUI<T extends DataSourceType> {
  private readonly _model: CognitePointCloudModel<T>;
  private readonly _viewer: Cognite3DViewer;
  private readonly _client: CogniteClient;

  private _boundingBoxGroup: THREE.Group | undefined;
  private _selectedAnnotation: AnnotationModel | undefined;
  private _selectedAnnotationFolder: dat.GUI;
  private _selectedAnnotationUiState: {
    id: number;
    createdTime: string;
    annotationStatus: string;
    annotationType: AnnotationType;
    creatingApp: string;
    creatingAppVersion: string;
    creatingUser: string | null;
    assetRef: number;
  } = {
    id: 0,
    createdTime: '',
    annotationStatus: '',
    annotationType: '',
    creatingApp: '',
    creatingAppVersion: '',
    creatingUser: '',
    assetRef: 0
  };
  private _createAnnotationsOnClick = false;

  constructor(uiFolder: dat.GUI, model: CognitePointCloudModel<T>, viewer: Cognite3DViewer, client: CogniteClient) {
    this._model = model;
    this._viewer = viewer;
    this._client = client;

    this.createDefaultStyleUi(uiFolder.addFolder('Default styling'));
    this.createByObjectIndexUi(uiFolder.addFolder('By object index styling'));
    this._selectedAnnotationFolder = uiFolder.addFolder('Selected annotation');

    this.createAnnotationUi(this._selectedAnnotationFolder);

    const state = {
      showBoundingBoxes: false,
      createAnnotationsOnClick: false
    };

    const actions = {
      deleteAllAnnotations: async () => {
        const annotations = await client.annotations
          .list({ filter: { annotatedResourceIds: [{ id: model.modelId }], annotatedResourceType: 'threedmodel' } })
          .autoPagingToArray({ limit: 1000 });

        await client.annotations.delete(annotations.map(annotation => ({ id: annotation.id })));

        console.log(`Deleted ${annotations.length} annotations`);
      },
      reset: () => {
        this._model.removeAllStyledObjectCollections();
      },
      randomColors: () => {
        model.stylableObjects.forEach(object => {
          const objectStyle = new THREE.Color(
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
          );
          if (isClassicPointCloudDataType(object)) {
            const annotationId = object.annotationId;
            const stylableObject = new AnnotationIdPointCloudObjectCollection([annotationId]);
            model.assignStyledObjectCollection(stylableObject, {
              color: objectStyle
            });
          } else if (isDMPointCloudDataType(object)) {
            const stylableObject = new PointCloudDMVolumeCollection([object.volumeInstanceRef]);
            model.assignStyledObjectCollection(stylableObject, {
              color: objectStyle
            });
          }
        });
      }
    };

    uiFolder.addFolder('DANGER ZONE').add(actions, 'deleteAllAnnotations').name('Delete all annotations for model');
    uiFolder.add(actions, 'reset').name('Reset all styled objects');
    uiFolder.add(actions, 'randomColors').name('Set random colors for objects');
    uiFolder
      .add(state, 'showBoundingBoxes')
      .name('Show object bounding boxes')
      .onChange((value: boolean) => this.toggleObjectBoundingBoxes(value));
    uiFolder
      .add(state, 'createAnnotationsOnClick')
      .name('Create annotations on model click')
      .onChange((value: boolean) => (this._createAnnotationsOnClick = value));
  }

  async createModelAnnotation<T extends DataSourceType>(position: THREE.Vector3, model: CognitePointCloudModel<T>) {
    if (!this._createAnnotationsOnClick) return;

    const cdfPosition = position.clone().applyMatrix4(model.getCdfToDefaultModelTransformation().invert());

    const annotation = await this._client.annotations.create([
      {
        annotatedResourceId: model.modelId,
        annotatedResourceType: 'threedmodel',
        annotationType: 'pointcloud.BoundingVolume',
        status: 'suggested',
        creatingApp: 'reveal-examples',
        creatingUser: 'reveal-user',
        creatingAppVersion: '0.0.1',
        data: {
          label: 'Dummy annotation',
          region: [
            {
              box: {
                matrix: new THREE.Matrix4().makeTranslation(cdfPosition.x, cdfPosition.y, cdfPosition.z).transpose()
                  .elements
              }
            }
          ]
        }
      }
    ]);

    console.log('Annotation successfully created', annotation);
  }

  async updateSelectedAnnotation(annotationId: number | undefined) {
    const { _client: client, _selectedAnnotationUiState: state } = this;

    if (!annotationId) {
      this._selectedAnnotation = undefined;
      return;
    }

    const annotation = (await client.annotations.retrieve([{ id: annotationId }]))[0];

    if (annotation) {
      this._selectedAnnotation = annotation;
      this.updateLastAnnotationState(annotation);
      this._selectedAnnotationFolder.updateDisplay();
    }
  }

  toggleObjectBoundingBoxes(b: boolean) {
    if (b) {
      this._boundingBoxGroup = new THREE.Group();
      this._model.traverseStylableObjects(object => {
        const box = new THREE.Box3Helper(object.boundingBox);
        this._boundingBoxGroup!.add(box);
      });
      this._model.stylableObjects.forEach(object => {
        if (isClassicPointCloudDataType(object)) {
          const box = new THREE.Box3Helper(object.boundingBox);
          this._boundingBoxGroup!.add(box);
        }
      });
      this._viewer.addObject3D(this._boundingBoxGroup);
    } else {
      this._boundingBoxGroup?.removeFromParent();
      this._boundingBoxGroup = undefined;
    }
    this._viewer.requestRedraw();
  }

  private createObjectAppearanceUi(uiFolder: dat.GUI): () => PointCloudAppearance {
    const appearance: PointCloudAppearance = { ...DefaultPointCloudAppearance };

    const state = {
      color: '#ffffff',
      visible: true
    };

    uiFolder
      .add(state, 'visible')
      .name('Visible')
      .onFinishChange(visibility => {
        appearance.visible = visibility;
      });
    uiFolder
      .addColor(state, 'color')
      .name('Color')
      .onFinishChange(color => {
        appearance.color = new THREE.Color(color);
      });

    return () => {
      const clone: PointCloudAppearance = { ...appearance };
      return clone;
    };
  }

  private updateLastAnnotationState(annotation: AnnotationModel) {
    const { _selectedAnnotationUiState: state } = this;

    state.id = annotation.id;
    state.createdTime = annotation.createdTime.toDateString();
    state.creatingApp = annotation.creatingApp;
    state.assetRef = (annotation.data as AnnotationsBoundingVolume).assetRef?.id ?? -1;
    state.annotationStatus = annotation.status;
    state.annotationType = annotation.annotationType;
    state.creatingUser = annotation.creatingUser;
    state.creatingAppVersion = annotation.creatingAppVersion;
  }

  private createAnnotationUi(ui: dat.GUI) {
    const { _selectedAnnotationUiState: state } = this;
    const buttonActions = {
      updateAssetRef: async () => {
        const { _selectedAnnotation } = this;

        if (!_selectedAnnotation) return;

        await this._client.annotations.update([
          {
            id: _selectedAnnotation.id,
            update: {
              data: {
                set: {
                  ..._selectedAnnotation.data,
                  assetRef: { id: state.assetRef }
                }
              }
            }
          }
        ]);
      }
    };

    for (const key of Object.keys(state).map(key => key as keyof typeof state)) {
      ui.add(state, key);
    }

    ui.add(buttonActions, 'updateAssetRef').name('Update asset reference');
  }

  private createDefaultStyleUi(ui: dat.GUI) {
    const createAppearanceCb = this.createObjectAppearanceUi(ui);
    const actions = {
      apply: () => {
        const appearance = createAppearanceCb();
        this._model.setDefaultPointCloudAppearance(appearance);
      }
    };
    ui.add(actions, 'apply').name('Apply');
  }

  private createByObjectIndexUi(ui: dat.GUI) {
    const state = { from: 0, count: 1, annotationId: 0 };
    const createAppearanceCb = this.createObjectAppearanceUi(ui);
    const actions = {
      apply: () => {
        const numIndices = Math.min(state.count, this._model.stylableObjectCount - state.from + 1);

        const allAnnotationIds: number[] = [];
        this._model.traverseStylableObjects(volume => {
          if ('annotationId' in volume) {
            allAnnotationIds.push(volume.annotationId);
          }
        });
        const selectedIds = allAnnotationIds.slice(state.from, state.from + numIndices);

        const ids = state.annotationId !== 0 ? [state.annotationId] : selectedIds;

        const objects = new AnnotationIdPointCloudObjectCollection(ids);
        const appearance = createAppearanceCb();
        this._model.assignStyledObjectCollection(objects, appearance);
      }
    };
    ui.add(state, 'from', 0, this._model.stylableObjectCount - 1, 1).name('First object ID');
    ui.add(state, 'count', 1, this._model.stylableObjectCount, 1).name('Object ID count');
    ui.add(state, 'annotationId', 0).name(`Object's annotationId`);
    ui.add(actions, 'apply').name('Apply');
  }
}
