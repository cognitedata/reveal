import { Water } from 'three/examples/jsm/objects/Water';
import { resetViewerEventHandlers } from '../viewerUtilities';
import * as THREE from 'three';

const reveal = typeof window === 'undefined' ? {} : require('@cognite/reveal');

export const customScope: Record<string, any> = {
  resetViewerEventHandlers,
  THREE,
  Water,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/img/sky007.jpg',
  },
  PotreePointShape: reveal.PotreePointShape,
  PotreePointColorType: reveal.PotreePointColorType,

  // new in 1.2
  ...(reveal.WellKnownAsprsPointClassCodes && {
    WellKnownAsprsPointClassCodes: reveal.WellKnownAsprsPointClassCodes,
  }),
};
