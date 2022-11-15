/*!
 * Copyright 2022 Cognite AS
 */

import {
  Cognite3DViewer,
  CognitePointCloudModel,
  AnnotationIdPointCloudObjectCollection,
  PointCloudAppearance,
  DefaultPointCloudAppearance,
  PointCloudObjectMetadata,
  THREE
} from '@cognite/reveal';

export class PointCloudObjectStylingUI {

  private readonly _model: CognitePointCloudModel;
  private readonly _viewer: Cognite3DViewer;

  private _boundingBoxGroup: THREE.Group | undefined;

  constructor(uiFolder: dat.GUI,
              model: CognitePointCloudModel,
              viewer: Cognite3DViewer) {
    this._model = model;
    this._viewer = viewer;

    this.createDefaultStyleUi(uiFolder.addFolder('Default styling'));
    this.createByObjectIndexUi(uiFolder.addFolder('By object index styling'));

    const state = {
      showBoundingBoxes: false
    };

    const actions = {
      reset: () => {
        this._model.removeAllStyledObjectCollections();
      },
      randomColors: () => {
        model.traverseStylableObjects((object: PointCloudObjectMetadata) => {
          const objectStyle = new THREE.Color(
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
          );

          const stylableObject = new AnnotationIdPointCloudObjectCollection([
            object.annotationId,
          ]);
          model.assignStyledObjectCollection(stylableObject, {
            color: objectStyle,
          });
        });
      },
    };

    uiFolder.add(actions, 'reset').name('Reset all styled objects');
    uiFolder.add(actions, 'randomColors').name('Set random for objects');
    uiFolder.add(state, 'showBoundingBoxes').name('Show object bounding boxes').onChange((value: boolean) => this.toggleObjectBoundingBoxes(value));
  }

  toggleObjectBoundingBoxes (b: boolean) {
    if (b) {
      this._boundingBoxGroup = new THREE.Group();
      this._model.traverseStylableObjects((object) => {
        const box = new THREE.Box3Helper(object.boundingBox);
        this._boundingBoxGroup!.add(box);
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

    uiFolder.add(state, 'visible').name('Visible').onFinishChange(visibility => {
      appearance.visible = visibility;
    });
    uiFolder.addColor(state, 'color').name('Color').onFinishChange(color => {
      appearance.color = new THREE.Color(color);
    });

    return () => {
      const clone: PointCloudAppearance = { ...appearance };
      return clone;
    };
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
    const state = { from: 1, count: 1, annotationId: 0 };
    const createAppearanceCb = this.createObjectAppearanceUi(ui);
    const actions = {
      apply: () => {
        const numIndices = Math.min(state.count, this._model.stylableObjectCount - state.from + 1);

        const allAnnotationIds: number[] = [];
        this._model.traverseStylableObjects(id => allAnnotationIds.push(id.annotationId));
        const selectedIds = allAnnotationIds.slice(state.from, state.from + numIndices);

        const ids = state.annotationId !== 0 ? [state.annotationId]: selectedIds;

        const objects = new AnnotationIdPointCloudObjectCollection(ids);
        const appearance = createAppearanceCb();
        this._model.assignStyledObjectCollection(objects, appearance);
      }
    };
    ui.add(state, 'from', 1, this._model.stylableObjectCount, 1).name('First object ID');
    ui.add(state, 'count', 1, this._model.stylableObjectCount, 1).name('Object ID count');
    ui.add(state, 'annotationId', 0).name(`Object's annotationId`);
    ui.add(actions, 'apply').name('Apply');
  }
};
