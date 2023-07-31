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
