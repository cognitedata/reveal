export const getMapLayerData = () => {
  return {
    id: 'QuadrantsSource',
    data: {
      type: 'FeatureCollection',
      name: 'Quadrants',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0.9982, 62.50417],
                [0.99817, 62.99958],
                [0.52763, 62.99957],
                [0.7892, 62.73743],
                [0.9982, 62.50417],
              ],
            ],
          },
          properties: { Quadrant: '6200' },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-1.0017, 58.99938],
                [-1.00175, 59.99942],
                [-2.00178, 59.99941],
                [-2.00173, 58.99937],
                [-1.0017, 58.99938],
              ],
            ],
          },
          properties: { Quadrant: '6' },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-0.00168, 58.99939],
                [-0.00172, 59.99943],
                [-1.00175, 59.99942],
                [-1.0017, 58.99938],
                [-0.00168, 58.99939],
              ],
            ],
          },
          properties: { Quadrant: '7' },
        },
      ],
    },
  };
};
