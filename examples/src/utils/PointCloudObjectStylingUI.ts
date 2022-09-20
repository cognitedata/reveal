/*!
 * Copyright 2022 Cognite AS
 */

import {
  CognitePointCloudModel,
  AnnotationIdPointCloudObjectCollection,
  PointCloudAppearance,
  DefaultPointCloudAppearance
} from '@cognite/reveal';
import * as THREE from 'three';

export class PointCloudObjectStylingUI {

  private readonly _model: CognitePointCloudModel;

  constructor(uiFolder: dat.GUI, model: CognitePointCloudModel) {
    this._model = model;

    this.createDefaultStyleUi(uiFolder.addFolder('Default styling'));
    this.createByObjectIndexUi(uiFolder.addFolder('By object index styling'));

    const actions = {
      reset: () => {
        this._model.removeAllStyledObjectCollections();
      },
      randomColors: () => {
        model.traverseStylableObjects((object) => {
          const objectStyle: [number, number, number] = [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
          ];

          const stylableObject = new AnnotationIdPointCloudObjectCollection([
            object.annotationId,
          ]);
          model.assignStyledObjectCollection(stylableObject, {
            color: objectStyle,
          });
        });
      }
    };

    uiFolder.add(actions, 'reset').name('Reset all styled objects');
    uiFolder.add(actions, 'randomColors').name('Set random for objects');
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
      appearance.color = hexStringToColor(color);
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


function hexStringToColor(hexColor: string): [number, number, number] {
  const threeColor = new THREE.Color(hexColor);
  return [
    Math.floor(threeColor.r * 255),
    Math.floor(threeColor.g * 255),
    Math.floor(threeColor.b * 255)];
}
