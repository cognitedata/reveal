/*
 * Copyright 2023 Cognite AS
 */

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
          coll.setDefaultStyle({
            color: new THREE.Color(state.color as THREE.ColorRepresentation),
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
