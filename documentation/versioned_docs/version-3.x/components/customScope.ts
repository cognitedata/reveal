import { THREE } from '@cognite/reveal';

import { Water } from 'three/examples/jsm/objects/Water';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as viewerUtils from '../utils/viewerUtilities';

const reveal = typeof window === 'undefined' ? {} : require('@cognite/reveal');
const revealTools = typeof window === 'undefined' ? {} : require('@cognite/reveal/tools');

export const customScope: Record<string, any> = {
  ...viewerUtils,
  ...reveal,
  ...revealTools,
  Water,
  THREE,
  DragControls,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/reveal-docs/img/sky007.jpg'
  }
};
