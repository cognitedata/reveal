/*
 * Copyright 2023 Cognite AS
 */

import { AnnotationsObjectDetection } from '@cognite/sdk';

import * as dat from 'dat.gui';

import { Image360UI } from './Image360UI';

import * as THREE from 'three';

export class Image360StylingUI {
  constructor(image360Ui: Image360UI, gui: dat.GUI) {
    const state = {
      color: '#ffffff',
      visible: true
    };

    const actions = {
      addStyle: () => {
        image360Ui.collections.forEach(coll =>
          coll.setDefaultAnnotationStyle({
            color: new THREE.Color(state.color as THREE.ColorRepresentation),
            visibility: state.visible
          })
        );
      }
    };

    gui.add(state, 'visible').name('Visible');

    gui.addColor(state, 'color').name('Color');

    gui.add(actions, 'addStyle').name('Set default style');
  }
}
