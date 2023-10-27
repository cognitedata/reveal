import { getIcon } from '../getIcon';

describe('getIcon', () => {
  it('should return "User" for user-related values', () => {
    const userRelatedValues = ['user', 'person', 'director'];
    userRelatedValues.forEach((value) => {
      expect(getIcon(value)).toBe('User');
    });
  });

  it('should return "Assets" for the "asset" value', () => {
    expect(getIcon('asset')).toBe('Assets');
  });

  it('should return "Timeseries" for timeseries-related values', () => {
    const timeseriesRelatedValues = ['time series', 'timeseries'];
    timeseriesRelatedValues.forEach((value) => {
      expect(getIcon(value)).toBe('Timeseries');
    });
  });

  it('should return "Document" for document-related values', () => {
    const documentRelatedValues = ['document', 'file'];
    documentRelatedValues.forEach((value) => {
      expect(getIcon(value)).toBe('Document');
    });
  });

  it('should return "Gauge" for gauge-related values', () => {
    const gaugeRelatedValues = [
      'pump',
      'compressor',
      'valve',
      'flange',
      'tank',
    ];
    gaugeRelatedValues.forEach((value) => {
      expect(getIcon(value)).toBe('Gauge');
    });
  });

  it('should return "WorkOrders" for the "workorder" value', () => {
    expect(getIcon('workorder')).toBe('WorkOrders');
  });

  it('should return "ReportList" for the "workitem" value', () => {
    expect(getIcon('workitem')).toBe('ReportList');
  });

  it('should return "Cube" for 3D-related values', () => {
    const threedRelatedValues = ['3d', 'threed'];
    threedRelatedValues.forEach((value) => {
      expect(getIcon(value)).toBe('Cube');
    });
  });

  it('should return "List" for the "properties" value', () => {
    expect(getIcon('properties')).toBe('List');
  });

  it('should return "Component" for unknown values', () => {
    const unknownValues = ['unknown', 'random'];
    unknownValues.forEach((value) => {
      expect(getIcon(value)).toBe('Component');
    });
  });
});
