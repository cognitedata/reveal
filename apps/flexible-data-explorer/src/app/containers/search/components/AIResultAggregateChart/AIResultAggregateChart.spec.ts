import {
  GroupedQueryResultItem, // TODO: import from llm-hub
  getChartDatasets,
  getChartLabels,
  getChartSubtitle,
} from './AIResultAggregateChart';

describe('getChartDatasets', () => {
  it('should return corrct results for mockData1', () => {
    const result = getChartDatasets(mockData1);
    expect(result.length).toEqual(2);
    expect(result[0].label).toEqual('sum of durationHours');
    expect(result[0].data).toEqual([3, 5]);
    expect(result[1].label).toEqual('sum of actualHours');
    expect(result[1].data).toEqual([4, 8]);
  });

  it('should return corrct results for mockData2', () => {
    const result = getChartDatasets(mockData2);
    expect(result.length).toEqual(1);
    expect(result[0].label).toEqual('count of externalId');
    expect(result[0].data).toEqual([534, 407]);
  });
});

describe('getChartLabels', () => {
  it('should return corrct results for mockData1', () => {
    const result = getChartLabels(mockData1);
    expect(result).toEqual(['FAO-071979', 'FAO-073479']);
  });

  it('should return corrct results for mockData2', () => {
    const result = getChartLabels(mockData2);
    expect(result).toEqual(['1116', '1152']);
  });
});

describe('getChartSubtitle', () => {
  it('should return corrct results for mockData1', () => {
    const result = getChartSubtitle(mockData1);
    expect(result).toEqual('durationHours, actualHours by workOrderNumber');
  });

  it('should return corrct results for mockData2', () => {
    const result = getChartSubtitle(mockData2);
    expect(result).toEqual('externalId by categoryId');
  });
});

const mockData1: GroupedQueryResultItem[] = [
  {
    group: {
      workOrderNumber: 'FAO-071979',
    },
    sum: {
      durationHours: 3,
      actualHours: 4,
    },
  },
  {
    group: {
      workOrderNumber: 'FAO-073479',
    },
    sum: {
      durationHours: 5,
      actualHours: 8,
    },
  },
];

const mockData2: GroupedQueryResultItem[] = [
  {
    group: {
      categoryId: '1116',
    },
    count: {
      externalId: 534,
    },
  },
  {
    group: {
      categoryId: '1152',
    },
    count: {
      externalId: 407,
    },
  },
];
