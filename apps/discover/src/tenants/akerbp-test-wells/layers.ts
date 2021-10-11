import { mapService } from 'modules/map/service';

import { Layers } from '../types';

export default {
  Well_Heads: {
    remoteService: mapService.getWellHeads,
    name: 'Well Heads',
    color: 'transparent',
    defaultOn: true,
    mapLayers: [],
    weight: 101,
  },
} as Layers;
