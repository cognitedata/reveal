import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as viewerUtils from '../utils/viewerUtilities';

const reveal = typeof window === 'undefined' ? {} : require('@cognite/reveal');

export const customScope: Record<string, any> = {
  ...viewerUtils,
  ...reveal,
  Water,
  THREE,
  DragControls,
  GLTFLoader,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/reveal-docs/img/sky007.jpg',
    gltfModelUrl: '/reveal-docs/gltf/3d_industrial_tanker.glb'
  },
};
