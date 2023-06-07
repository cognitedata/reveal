export const groupsMockData = [
  {
    id: 1658310948207,
    isDeleted: false,
    deletedTime: -1,
    name: 'templates-preview',
    sourceId: '1c0a7f13-ac64-46d3-a94e-0bed87688bd4',
    capabilities: [
      {
        templateGroupsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        templateInstancesAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        datasetsAcl: {
          actions: ['READ', 'WRITE', 'OWNER'],
          scope: {
            all: {},
          },
        },
      },
    ],
  },
  {
    id: 1658310948208,
    isDeleted: false,
    deletedTime: -1,
    name: 'all-resources',
    sourceId: '1c0a7f13-ac64-46d3-a94e-0bed87688bd4',
    capabilities: [
      {
        threedAcl: {
          actions: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
          scope: {
            all: {},
          },
        },
      },
      {
        assetsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        eventsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        filesAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        rawAcl: {
          actions: ['READ', 'WRITE', 'LIST'],
          scope: {
            all: {},
          },
        },
      },
      {
        relationshipsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        sequencesAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        timeSeriesAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        labelsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
      {
        transformationsAcl: {
          actions: ['READ', 'WRITE'],
          scope: {
            all: {},
          },
        },
      },
    ],
  },
  {
    id: 1658310948209,
    isDeleted: false,
    deletedTime: -1,
    name: 'schema',
    sourceId: '1c0a7f13-ac64-46d3-a94e-0bed87688bd4',
    capabilities: [
      {
        experimentAcl: {
          actions: ['USE'],
          scope: {
            experimentscope: {
              experiments: ['schema'],
            },
          },
        },
      },
    ],
  },
  {
    id: 1658310948210,
    isDeleted: false,
    deletedTime: -1,
    name: 'datamodelstorage',
    sourceId: '1c0a7f13-ac64-46d3-a94e-0bed87688bd4',
    capabilities: [
      {
        experimentAcl: {
          actions: ['USE'],
          scope: {
            experimentscope: {
              experiments: ['datamodelstorage'],
            },
          },
        },
      },
    ],
  },
];
