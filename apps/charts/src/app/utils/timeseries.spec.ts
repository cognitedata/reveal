import { calculateGranularity } from './timeseries';

describe('calculateGranularity', () => {
  it('generates correct ouput', () => {
    const testCases: [[number, number], number, string][] = [
      [[1595803251697, 1764807501957], 1000, '2d'],
      [[1595803251697, 1680305376827], 1000, '24h'],
      [[1586821790057, 1633102866628], 1000, '13h'],
      [[1610110088723, 1610675463279], 1000, '10m'],
      [[1610281928811, 1610499491806], 1000, '4m'],
      [[1610395159451, 1610395396969], 1000, '1s'],
    ];

    testCases.forEach((testCase) => {
      const granularity = calculateGranularity(testCase[0], testCase[1]);
      expect(granularity).toEqual(testCase[2]);
    });
  });
});
