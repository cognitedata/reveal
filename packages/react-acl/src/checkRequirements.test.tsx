import { checkRequirement } from './checkRequirements';
import { ProcessedAcls } from './types';

const getMockAccess = () =>
  ({
    assetsAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    eventsAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    filesAcl: { scope: { all: {} }, actions: ['READ'] },
    usersAcl: { scope: { all: {} }, actions: ['READ'] },
    projectsAcl: { scope: { all: {} }, actions: ['READ'] },
    securityCategoriesAcl: { scope: { all: {} }, actions: ['READ'] },
    rawAcl: { scope: { all: {} }, actions: ['READ'] },
    timeSeriesAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    apikeysAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    threedAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    sequencesAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    analyticsAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    relationshipsAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    geospatialAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    seismicAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    labelsAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    wellsAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
    datasetsAcl: { scope: { all: {} }, actions: ['READ', 'WRITE'] },
  } as ProcessedAcls);

describe('checkRequirement', () => {
  it('should be ok with exact requirements', () => {
    expect(
      checkRequirement({
        requirement: {
          context: 'raw',
          aclName: 'rawAcl',
          acl: ['READ'],
        },
        currentAccess: getMockAccess(),
      })
    ).toEqual({
      name: 'raw',
      error: '',
      missing: [],
    });
  });

  it('should be ok if user has more permissions', () => {
    expect(
      checkRequirement({
        requirement: {
          context: 'relationships',
          aclName: 'relationshipsAcl',
          acl: ['READ'],
        },
        currentAccess: getMockAccess(),
      })
    ).toEqual({
      name: 'relationships',
      error: '',
      missing: [],
    });
  });

  it('should find missing requirements', () => {
    expect(
      checkRequirement({
        requirement: {
          context: 'files',
          aclName: 'filesAcl',
          acl: ['READ', 'WRITE'],
        },
        currentAccess: getMockAccess(),
      })
    ).toEqual({
      error: '',
      missing: ['WRITE'],
      name: 'files',
    });
  });
});
