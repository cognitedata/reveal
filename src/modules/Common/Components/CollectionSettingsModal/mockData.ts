import { KeypointCollection, Shape } from './CollectionSettingsTypes';

export const predefinedKeypoints: KeypointCollection[] = [
  {
    collectionName: 'Dial',
    keypoints: [
      {
        caption: 'Centre',
        order: '1',
        color: '#e3a1ec',
      },
      {
        caption: 'V1',
        order: '2',
        color: '#4a67fb',
      },
      {
        caption: 'V2',
        order: '3',
        color: '#fd5190',
      },
      {
        caption: 'V3',
        order: '4',
        color: '#ffbb00',
      },
    ],
  },
  {
    collectionName: 'Level',
    keypoints: [
      {
        caption: 'V2',
        order: '3',
        color: '#fd5190',
      },
      {
        caption: 'V3',
        order: '4',
        color: '#ffbb00',
      },
    ],
  },
  {
    collectionName: 'Large gauge',
  },
];

export const predefinedShapes: Shape[] = [
  { ShapeName: 'Dial', color: '#00665c' },
  { ShapeName: 'Gauge', color: '#6ED8BE' },
  { ShapeName: 'Level', color: '#24D8ED' },
  { ShapeName: 'Value', color: '#FF8746' },
];
