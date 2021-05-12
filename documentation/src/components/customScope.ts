import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as viewerUtils from '../viewerUtilities';
import { AxisViewTool, ExplodedViewTool, HtmlOverlayTool, Corner } from '@cognite/reveal/tools';

const reveal = typeof window === 'undefined' ? {} : require('@cognite/reveal');

export const customScope: Record<string, any> = {
  ...viewerUtils,
  HtmlOverlayTool,
  ExplodedViewTool,
  AxisViewTool,
  Corner,
  THREE,
  Water,
  DragControls,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/img/sky007.jpg',
  },
  ...reveal,
};
