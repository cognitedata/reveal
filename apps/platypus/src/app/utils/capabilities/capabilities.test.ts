import { CombinedSCC, checkAuthorized, checkPermissions } from './capabilities';

const groupsMock = [
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
] as unknown as CombinedSCC[];
const tokenMock = [
  {
    experimentAcl: {
      actions: ['USE'],
      scope: { experimentscope: { experiments: ['schema'] } },
    },
  },
  {
    experimentAcl: {
      actions: ['USE'],
      scope: { experimentscope: { experiments: ['datamodelstorage'] } },
    },
  },
  {
    dataModelsAcl: {
      actions: ['WRITE'],
      scope: {
        all: {},
      },
      version: 1,
    },
    projectScope: {
      projects: ['platypus'],
    },
  },
] as unknown as CombinedSCC[];

const scopedTokenMock = [
  {
    dataModelsAcl: {
      actions: ['READ'],
      scope: {
        dataModelScope: { externalIds: ['foobar'] },
      },
      version: 1,
    },
    projectScope: {
      projects: ['platypus'],
    },
  },
  {
    dataModelsAcl: {
      actions: ['WRITE'],
      scope: {
        dataModelScope: { externalIds: ['foobar2'] },
      },
      version: 1,
    },
    projectScope: {
      projects: ['platypus'],
    },
  },
  {
    dataModelInstancesAcl: {
      actions: ['READ', 'WRITE'],
      scope: {
        dataModelScope: { externalIds: ['foobar3'] },
      },
      version: 1,
    },
    projectScope: {
      projects: ['platypus'],
    },
  },
] as unknown as CombinedSCC[];

describe('check capabilities core functions', () => {
  it('should perform permissions check for user', () => {
    expect(
      checkPermissions('transformationsAcl', tokenMock, groupsMock, 'READ')
    ).toBe(true);
    expect(
      checkPermissions('timeSeriesAcl', tokenMock, groupsMock, 'READ')
    ).toBe(false);
  });
  it('should perform authorization check for user', () => {
    expect(
      checkAuthorized(
        tokenMock,
        ['identity', 'datamodelstorage', 'schema'],
        ['identity', 'datamodelstorage', 'schema']
      )
    ).toBe(true);
    expect(
      checkAuthorized(tokenMock, ['identity'], ['datamodelstorage', 'schema'])
    ).toBe(false);
  });
  it('should enforce capability read write for externalId seperate', () => {
    // foobar can be read but not written to
    expect(
      checkPermissions('dataModelsAcl', scopedTokenMock, [], 'READ', 'foobar')
    ).toBe(true);
    expect(
      checkPermissions('dataModelsAcl', scopedTokenMock, [], 'READ', 'foobar2')
    ).toBe(false);
    // foobar2 can be read but not written to
    expect(
      checkPermissions('dataModelsAcl', scopedTokenMock, [], 'WRITE', 'foobar')
    ).toBe(false);
    expect(
      checkPermissions('dataModelsAcl', scopedTokenMock, [], 'WRITE', 'foobar2')
    ).toBe(true);
    // foobar3 can be read and written to
    expect(
      checkPermissions(
        'dataModelInstancesAcl',
        scopedTokenMock,
        [],
        'READ',
        'foobar3'
      )
    ).toBe(true);
    expect(
      checkPermissions(
        'dataModelInstancesAcl',
        scopedTokenMock,
        [],
        'WRITE',
        'foobar3'
      )
    ).toBe(true);
  });
  it('should check all if specified for write access', () => {
    // check all should fail for scopedToken
    expect(
      checkPermissions(
        'dataModelsAcl',
        scopedTokenMock,
        [],
        'READ',
        undefined,
        true
      )
    ).toBe(false);
    expect(
      checkPermissions('dataModelsAcl', tokenMock, [], 'WRITE', undefined, true)
    ).toBe(true);
  });
});
