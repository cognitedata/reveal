import { Water } from 'three/examples/jsm/objects/Water';
import { resetViewerEventHandlers } from '../viewerUtilities';
import * as THREE from 'three';

export const customScope: Record<string, any> = {
  resetViewerEventHandlers,
  THREE,
  Water,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/img/sky007.jpg',
  },
};
