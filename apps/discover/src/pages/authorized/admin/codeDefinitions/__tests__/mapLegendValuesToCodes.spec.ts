import { mapLegendValuesToCodes } from '../utils/mapLegendValuesToCodes';

describe('utils', () => {
  it('mapLegendValuesToCodes', () => {
    expect(
      mapLegendValuesToCodes(
        ['DFAL', 'CEMT'],
        [{ id: 'DFAL', type: 'code', legend: 'something', event: '' }]
      )
    ).toEqual([
      {
        code: 'DFAL',
        definition: 'something',
      },
      {
        code: 'CEMT',
        definition: '',
      },
    ]);
  });
});
