import { AllAccess, checkACL } from '../UserAccessList';

const getMockInput = (): AllAccess => ({
  relationships: { missing: ['READ'], error: '' },
  geospatial: { missing: ['READ'], error: '' },
  seismic: { missing: ['READ'], error: '' },
  labels: { missing: ['READ'], error: '' },
  datasets: { missing: ['READ'], error: '' },
  files: { missing: ['READ', 'WRITE'], error: '' },
  sequences: { missing: ['READ'], error: '' },
  assets: { missing: ['READ'], error: '' },
  'discover-api': { missing: ['LIST'], error: '' },
  wells: { missing: ['LIST'], error: '' },
});

const getMockOutput = () => ({
  assets: { error: '', missing: ['READ'] },
  datasets: { error: '', missing: ['READ'] },
  files: { error: '', missing: ['READ, WRITE'] },
  geospatial: { error: '', missing: ['READ'] },
  labels: { error: '', missing: ['READ'] },
  relationships: { error: '', missing: ['READ'] },
  seismic: { error: '', missing: ['READ'] },
  sequences: { error: '', missing: ['READ'] },
  'discover-api': { error: '', missing: ['LIST'] },
  wells: { error: '', missing: ['LIST'] },
});

describe('UserAccessList', () => {
  it('should find missing files', () => {
    expect(
      checkACL({
        result: getMockInput(),
        item: {},
        aclName: 'filesAcl',
        acl: 'READ',
        context: 'files',
      })
    ).toEqual({
      ...getMockOutput(),
      files: { error: 'files not found', missing: ['READ', 'WRITE'] },
    });
  });

  it('should find files:READ', () => {
    expect(
      checkACL({
        result: getMockInput(),
        item: {
          filesAcl: {
            actions: ['READ', 'WRITE'],
            scope: { all: {} },
          },
        },
        aclName: 'filesAcl',
        acl: 'READ',
        context: 'files',
      })
    ).toEqual({
      ...getMockOutput(),
      files: { error: '', missing: ['WRITE'] },
    });
  });
});
