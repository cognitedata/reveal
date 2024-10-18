/*
 * Copyright 2023 Cognite AS
 */

import * as dat from 'dat.gui';

import * as THREE from 'three';
import { Cognite3DViewer } from '@cognite/reveal';

export class Image360StylingUI {
  constructor(viewer: Cognite3DViewer, gui: dat.GUI) {
    const state = {
      color: '#ffffff',
      visible: true
    };

    const actions = {
      addStyle: () => {
        viewer.get360ImageCollections().forEach(collections =>
          collections.setDefaultAnnotationStyle({
            color: new THREE.Color(state.color as THREE.ColorRepresentation).convertLinearToSRGB(),
            visible: state.visible
          })
        );
      }
    };

    gui.add(state, 'visible').name('Visible');

    gui.addColor(state, 'color').name('Color');

    gui.add(actions, 'addStyle').name('Set default style');
  }
}
