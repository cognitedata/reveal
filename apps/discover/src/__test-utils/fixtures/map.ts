import { Asset } from 'modules/map/types';

export const getMockedAssets: Asset[] = [
  { name: 'Test1', geometry: { type: 'Point', coordinates: [1, 2] } },
  { name: 'Test2', geometry: { type: 'Point', coordinates: [1, 2] } },
  { name: 'Test3', geometry: { type: 'Point', coordinates: [1, 2] } },
  { name: 'Test4', geometry: { type: 'Point', coordinates: [1, 2] } },
  { name: 'Test5', geometry: { type: 'Point', coordinates: [1, 2] } },
];

export const getMapSource = () => {
  return [
    {
      id: 'Deep_Water_Bottom_Hole_Wells',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            geometry: { type: 'Polygon', coordinates: [0, 0] },
            type: 'Feature',
          },
        ],
      },
    },
    {
      id: 'Deep_Water_Surface_Hole_Wells',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            geometry: { type: 'Polygon', coordinates: [1, 2] },
            type: 'Feature',
          },
        ],
      },
    },
    {
      id: 'Well_Path',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            geometry: { type: 'Polygon', coordinates: [6, 6] },
            type: 'Feature',
          },
        ],
      },
    },
    {
      id: 'MMS_Protractions',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            geometry: { type: 'Polygon', coordinates: [1, 6] },
            type: 'Feature',
          },
        ],
      },
    },
  ];
};
export default {};
