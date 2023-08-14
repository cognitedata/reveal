import { getODataFDMServiceURL } from './PowerBIModal';

jest.mock('@cognite/cdf-utilities', () => {
  return {
    getCluster: () => 'mock-cluster',
    getProject: () => 'mock-project',
  };
});

describe('PowerBI Modal', () => {
  it('Should generate odata fdm service url', () => {
    const srvURL = getODataFDMServiceURL({
      space: 'myspace',
      externalId: 'myid',
      version: '1',
    });
    expect(srvURL).toBe(
      'https://mock-cluster/odata/21082023/projects/mock-project/models/spaces/myspace/datamodels/myid/versions/1'
    );
  });
});
