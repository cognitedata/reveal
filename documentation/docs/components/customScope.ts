import { Water } from 'three/examples/jsm/objects/Water';
import { resetViewerEventHandlers } from '../utils/viewerUtilities';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { AxisViewTool, ExplodedViewTool, HtmlOverlayTool, Corner } from '@cognite/reveal/tools';

const reveal = typeof window === 'undefined' ? {} : require('@cognite/reveal');

export const customScope: Record<string, any> = {
  resetViewerEventHandlers,
  HtmlOverlayTool,
  ExplodedViewTool,
  AxisViewTool,
  Corner,
  THREE: reveal.THREE,
  Water,
  DragControls,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/img/sky007.jpg',
  },
  PotreePointShape: reveal.PotreePointShape,
  PotreePointColorType: reveal.PotreePointColorType,

  WellKnownAsprsPointClassCodes: reveal.WellKnownAsprsPointClassCodes,
};
