import { flattenNestedObjArray } from './data-utils';

describe('DataUtils Test', () => {
  it('Should flattenNestedObjArray', async () => {
    const input = [
      { externalId: '1', space: 'test' },
      { externalId: '2', space: 'test' },
    ];
    const result = flattenNestedObjArray(input as any);
    expect(result).toEqual({ externalId: ['1', '2'], space: ['test'] });
  });
});
