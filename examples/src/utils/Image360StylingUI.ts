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
      labelText: '',
      color: '#ffffff',
      visible: true
    };

    const actions = {
      addStyle: () => {
        image360Ui.collections.forEach(coll => coll.setDefaultStyle({}));
      }
    };

    gui.add(state, 'labelText').name('Label text');
    gui.add(state, 'visible').name('Visible');

    gui.addColor(state, 'color').name('Color');

    gui.add(actions, 'Set default style').name('Add style');
  }
}
