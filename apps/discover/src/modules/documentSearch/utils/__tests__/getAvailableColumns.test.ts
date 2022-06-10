import { getAvailableColumns } from '../getAvailableColumns';

describe('getAvailableColumns', () => {
  it('should return empty result with empty input', () => {
    expect(getAvailableColumns({})).toEqual([]);
  });

  it('should', () => {
    const testData = {
      creationdate: {
        Header: 'Created',
        accessor: 'createdDisplay',
        id: 'created',
        order: 1,
        width: '140px',
      },
    };
    const result = getAvailableColumns(testData);

    expect(result).toMatchObject([
      {
        ...testData.creationdate,
        disabled: false,
        field: 'creationdate',
        selected: false,
      },
    ]);
  });
});
