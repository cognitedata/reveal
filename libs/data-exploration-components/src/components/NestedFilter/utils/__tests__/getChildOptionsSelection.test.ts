import { getChildOptionsSelection } from '../getChildOptionsSelection';

jest.mock('@cognite/unified-file-viewer', () => jest.fn());

describe('NestedFilter/getChildOptionsSelection', () => {
  it('should return empty object', () => {
    expect(getChildOptionsSelection([])).toEqual({});
    expect(getChildOptionsSelection([{ value: 'value' }])).toEqual({});
  });

  it('should return all child options in the selection', () => {
    expect(
      getChildOptionsSelection([{ value: 'value1' }, { value: 'value2' }], [])
    ).toEqual({ value1: [], value2: [] });
  });

  it('should return selected child options in the selection', () => {
    expect(
      getChildOptionsSelection(
        [{ value: 'value1' }, { value: 'value2' }],
        ['value1']
      )
    ).toEqual({ value1: [] });
  });
});
