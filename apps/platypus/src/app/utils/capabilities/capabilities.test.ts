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
] as unknown as CombinedSCC[];

describe('check capabilities core functions', () => {
  it('should perform permissions check for user', () => {
    expect(
      checkPermissions('transformationsAcl', tokenMock, groupsMock, ['READ'])
    ).toBe(true);
    expect(
      checkPermissions('timeSeriesAcl', tokenMock, groupsMock, ['READ'])
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
});
