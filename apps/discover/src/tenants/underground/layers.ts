import { mapService } from 'modules/map/service';

const undergroundLayers = {
  Well_Heads: {
    remoteService: mapService.getWellHeads,
    name: 'Well Heads',
    color: 'transparent',
    defaultOn: true,
    mapLayers: [],
    weight: 101,
  },
};

export default undergroundLayers;
