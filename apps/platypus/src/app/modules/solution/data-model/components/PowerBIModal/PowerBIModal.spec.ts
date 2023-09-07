import {
  getODataFDMProjectField,
  getODataFDMEnvironmentField,
} from './PowerBIModal';

jest.mock('@cognite/cdf-utilities', () => {
  return {
    getProject: () => 'mock-project',
  };
});
describe('Power BI Modal', () => {
  it('Should generate odata DM project field for Power BI', () => {
    const result = getODataFDMProjectField({
      space: 'myspace',
      externalId: 'myid',
      version: '1',
    });
    expect(result).toBe(
      'mock-project/models/spaces/myspace/datamodels/myid/versions/1'
    );
  });

  it('Should generate odata DM environment field for Power BI', () => {
    const result = getODataFDMEnvironmentField('https://mock-cluster.com');
    expect(result).toBe('https://mock-cluster.com/20230821');
  });
});
