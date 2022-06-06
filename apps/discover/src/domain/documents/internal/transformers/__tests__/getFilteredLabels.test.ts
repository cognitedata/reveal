import { getFilteredLabels } from '../getFilteredLabels';

describe('getFilteredLabels', () => {
  test('Should return filtered document labels', () => {
    const documentlabels = [
      { externalId: 'EX1' },
      { externalId: 'EX2' },
      { externalId: 'EX3' },
    ];
    const queryLabels = [
      {
        id: 'EX1',
        name: 'Label1',
        count: 0,
      },
      {
        id: 'EX2',
        name: 'Label2',
        count: 0,
      },
    ];
    expect(getFilteredLabels(documentlabels, queryLabels)).toEqual([
      'Label1',
      'Label2',
    ]);
  });
});
