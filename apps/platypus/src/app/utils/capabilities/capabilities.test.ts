import { CombinedSCC, checkAuthorized, checkPermissions } from './capabilities';

const successMock = [
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
    experimentAcl: {
      actions: ['USE'],
      scope: { experimentscope: { experiments: ['identity'] } },
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
const failedMock = [
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
    transformationsAcl: {
      actions: ['READ'],
      scope: {
        all: {},
      },
    },
  },
] as unknown as CombinedSCC[];

describe('check capabilities core functions', () => {
  it('should perform permissions check for user', () => {
    expect(checkPermissions('transformationsAcl', successMock, ['READ'])).toBe(
      true
    );
    expect(checkPermissions('transformationsAcl', failedMock, ['WRITE'])).toBe(
      false
    );
  });
  it('should perform authorization check for user', () => {
    expect(
      checkAuthorized(
        successMock,
        ['identity', 'datamodelstorage', 'schema'],
        ['identity', 'datamodelstorage', 'schema']
      )
    ).toBe(true);
    expect(
      checkAuthorized(failedMock, ['identity'], ['datamodelstorage', 'schema'])
    ).toBe(false);
  });
});
