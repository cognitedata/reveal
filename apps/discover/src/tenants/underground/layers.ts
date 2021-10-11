import { mapService } from 'modules/map/service';

export default {
  Well_Heads: {
    remoteService: mapService.getWellHeads,
    name: 'Well Heads',
    color: 'transparent',
    defaultOn: true,
    mapLayers: [],
    weight: 101,
  },
};
