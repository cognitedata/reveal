export const userTokenData = {
  subject: 'OcJ9QWErtY35I-uzLiS2Razr7-i3ayRFG3oY5wbS-12345',
  projects: [
    {
      projectUrlName: 'platypus',
      groups: [123456789],
    },
  ],
  capabilities: [
    {
      assetsAcl: {
        actions: ['READ', 'WRITE'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      groupsAcl: {
        actions: ['CREATE', 'DELETE', 'UPDATE', 'LIST', 'READ'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      projectsAcl: {
        actions: ['UPDATE', 'LIST', 'READ'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      rawAcl: {
        actions: ['READ', 'WRITE', 'LIST'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      sessionsAcl: {
        actions: ['CREATE'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      datasetsAcl: {
        actions: ['READ', 'WRITE', 'OWNER'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      eventsAcl: {
        actions: ['READ', 'WRITE'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      entitymatchingAcl: {
        actions: ['READ', 'WRITE'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      filesAcl: {
        actions: ['READ', 'WRITE'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      datasetsAcl: {
        actions: ['OWNER'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      timeSeriesAcl: {
        actions: ['READ', 'WRITE'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      experimentAcl: {
        actions: ['USE'],
        scope: {
          experimentscope: {
            experiments: ['schema'],
          },
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      experimentAcl: {
        actions: ['USE'],
        scope: {
          experimentscope: {
            experiments: ['datamodelstorage'],
          },
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      timeSeriesAcl: {
        actions: ['READ', 'WRITE'],
        scope: {
          all: {},
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      experimentAcl: {
        actions: ['USE'],
        scope: {
          experimentscope: {
            experiments: ['identity'],
          },
        },
        version: 1,
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
    {
      transformationsAcl: {
        actions: ['READ', 'WRITE'],
        scope: {
          all: {},
        },
      },
      projectScope: {
        projects: ['platypus'],
      },
    },
  ],
};
