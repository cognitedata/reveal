import {
  getODataFDMProjectField,
  getODataFDMEnvironmentField,
} from './PowerBIModal';

jest.mock('@cognite/cdf-utilities', () => {
  return {
    getCluster: () => 'mock-cluster',
    getProject: () => 'mock-project',
  };
});

describe('PowerBI Modal', () => {
  it('Should generate odata fdm project field for PowerBI', () => {
    const result = getODataFDMProjectField({
      space: 'myspace',
      externalId: 'myid',
      version: '1',
    });
    expect(result).toBe(
      'mock-project/models/spaces/myspace/datamodels/myid/versions/1'
    );
  });

  it('Should generate odata fdm enviroment field for PowerBI', () => {
    const result = getODataFDMEnvironmentField();
    expect(result).toBe('https://mock-cluster/20230821');
  });
});
