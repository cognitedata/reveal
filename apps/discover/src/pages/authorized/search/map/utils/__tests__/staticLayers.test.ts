import {
  GROUPED_CLUSTER_COUNT_LAYER_ID,
  GROUPED_CLUSTER_LAYER_ID,
  SEISMIC_LAYER_ID,
  SEISMIC_LINE_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
} from 'pages/authorized/search/map/constants';

import { getStaticLayers } from '../staticLayers';

describe('staticLayers', () => {
  it('should be ok', () => {
    expect(getStaticLayers().id).toEqual('staticLayers');
    expect(getStaticLayers().layers).toHaveLength(5);
  });

  it('should include the grouped layers', () => {
    const { layers } = getStaticLayers();
    expect(layers.map((layer) => layer.id)).toEqual([
      SEISMIC_LAYER_ID,
      SEISMIC_LINE_LAYER_ID,
      GROUPED_CLUSTER_LAYER_ID,
      GROUPED_CLUSTER_COUNT_LAYER_ID,
      UNCLUSTERED_LAYER_ID,
    ]);
  });
});
