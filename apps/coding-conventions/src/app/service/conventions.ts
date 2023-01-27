import { System } from '../pages/conventions/types';

export const dummyConventions: System[] = [
  {
    id: '123',
    title: 'File name',
    subtitle: 'Extract file type',
    structure: 'ZZZZZZ NN-NN-NN NNN',
    conventions: [
      {
        range: {
          start: 7,
          end: 9,
        },
        keyword: 'NN',
        id: 'ABC',
        name: 'System',
        definitions: [
          {
            key: '10',
            id: 'system-10',
            description: 'PC',
            type: 'Abbreviation',
          },
          {
            type: 'Range',
            value: [0, 10],
            id: 'system-123',
            description: 'LOL',
          },
        ],
      },
      {
        range: {
          start: 10,
          end: 12,
        },
        keyword: 'NN',
        id: 'XYZ',
        name: 'Subsystem',
        definitions: [
          {
            type: 'Abbreviation',
            key: '10',
            description: 'CPU',
            id: '123',
            dependsOn: 'system-10',
          },
        ],
        dependency: 'ABC',
      },
    ],
  },
];
