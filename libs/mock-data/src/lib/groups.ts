export const groupsMockData = [
  {
    id: 1182524592259134,
    isDeleted: false,
    deletedTime: -1,
    name: 'templates-preview',
    sourceId: 'c456ffca-e0ba-41ff-ae8f-e754b86c7cd3',
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
    id: 1920640158166538,
    isDeleted: false,
    deletedTime: -1,
    name: 'all-resources',
    sourceId: 'c456ffca-e0ba-41ff-ae8f-e754b86c7cd3',
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
    id: 3428354942225754,
    isDeleted: false,
    deletedTime: -1,
    name: 'schema',
    sourceId: 'c456ffca-e0ba-41ff-ae8f-e754b86c7cd3',
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
    id: 6551888225678493,
    isDeleted: false,
    deletedTime: -1,
    name: 'datamodelstorage',
    sourceId: 'c456ffca-e0ba-41ff-ae8f-e754b86c7cd3',
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
