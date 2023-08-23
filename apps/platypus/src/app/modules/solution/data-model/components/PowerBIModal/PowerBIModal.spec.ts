import { getCluster } from '@cognite/cdf-utilities';

import {
  getODataFDMProjectField,
  getODataFDMEnvironmentField,
} from './PowerBIModal';

jest.mock('@cognite/cdf-utilities', () => {
  return {
    getCluster: jest.fn(),
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
    getCluster.mockImplementation(() => {
      return 'mock-cluster';
    });
    const result = getODataFDMEnvironmentField();
    expect(result).toBe('https://mock-cluster/20230821');
  });
  it('Should generate odata fdm enviroment when cluster is empty', () => {
    getCluster.mockImplementation(() => {
      return undefined;
    });
    const result = getODataFDMEnvironmentField();
    expect(result).toBe('https://api.cognitedata.com/20230821');
  });
});
