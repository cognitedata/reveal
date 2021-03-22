import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { HtmlOverlayTool } from '@cognite/reveal/tools';
import { ExplodedViewTool } from '@cognite/reveal/tools';
import * as reveal from '@cognite/reveal';
import * as viewerUtils from '../viewerUtilities';

export const customScope: Record<string, any> = {
  ...viewerUtils,
  HtmlOverlayTool,
  ExplodedViewTool,
  THREE,
  Water,
  DragControls,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/img/sky007.jpg',
  },
  ...reveal,
};
