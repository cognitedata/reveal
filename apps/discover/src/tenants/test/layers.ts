import { Layers } from '../types';

const layers: Layers = {
  testLayer1: {
    remote: `nonexistant.json`,
    name: 'Test Layer 11',
    color: 'rgba(251, 59, 134, 0.8)',
    defaultOn: true,
    mapLayers: [],
  },
  testLayer2: {
    remote: `license-layer.json`,
    name: 'Test searchable layer',
    color: 'rgba(251, 59, 134, 0.8)',
    defaultOn: false,
    searchable: 'License',
    mapLayers: [],
  },
};

export default layers;
