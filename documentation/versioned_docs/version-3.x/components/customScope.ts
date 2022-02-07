import { THREE } from '@cognite/reveal-3.x';

import { Water } from 'three/examples/jsm/objects/Water';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as viewerUtils from '../utils/viewerUtilities';

const reveal = typeof window === 'undefined' ? {} : require('@cognite/reveal-3.x');
const revealTools = typeof window === 'undefined' ? {} : require('@cognite/reveal-3.x/tools');

export const customScope: Record<string, any> = {
  ...viewerUtils,
  ...reveal,
  ...revealTools,
  THREE,
  Water,
  DragControls,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/img/sky007.jpg',
  },
  APIKeys: {
    BingMapAPI: 'AuViYD_FXGfc3dxc0pNa8ZEJxyZyPq1lwOLPCOydV3f0tlEVH-HKMgxZ9ilcRj-T',
    HereMapAPI: 'HqSchC7XT2PA9qCfxzFq',
    HereMapAppCode: '5rob9QcZ70J-m18Er8-rIA',
    MapboxAPI: 'pk.eyJ1IjoicHJhbW9kLXMiLCJhIjoiY2tzb2JkbXdyMGd5cjJubnBrM3IwMTd0OCJ9.jA9US2D2FRXUlldhE8bZgA'
  }
};
