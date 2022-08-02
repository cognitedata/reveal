export const getMapLayerDataBlocks = () => {
  return {
    id: 'BlocksSource',
    data: {
      type: 'FeatureCollection',
      name: 'Blocks',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [2.5376, 56.74933],
                [2.66519, 56.74933],
                [2.66518, 56.99934],
                [2.41646, 56.99934],
                [2.5376, 56.74933],
              ],
            ],
          },
          properties: { blcName: '1/2' },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [2.66519, 56.74933],
                [2.99853, 56.74934],
                [2.99852, 56.99935],
                [2.66518, 56.99934],
                [2.66519, 56.74933],
              ],
            ],
          },
          properties: { blcName: '1/3' },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [2.6652, 56.55239],
                [2.66519, 56.74933],
                [2.5376, 56.74933],
                [2.61186, 56.59433],
                [2.6652, 56.55239],
              ],
            ],
          },
          properties: { blcName: '1/5' },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [2.73247, 56.49933],
                [2.99854, 56.49933],
                [2.99853, 56.74934],
                [2.66519, 56.74933],
                [2.6652, 56.55239],
                [2.73247, 56.49933],
              ],
            ],
          },
          properties: { blcName: '1/6' },
        },
      ],
    },
  };
};
