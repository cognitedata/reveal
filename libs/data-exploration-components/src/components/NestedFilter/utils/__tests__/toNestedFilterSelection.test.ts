import { toNestedFilterSelection } from '../toNestedFilterSelection';

jest.mock('@cognite/unified-file-viewer', () => jest.fn());

describe('NestedFilter/toNestedFilterSelection', () => {
  it('should return empty object', () => {
    expect(toNestedFilterSelection([])).toEqual({});
  });
  it('should return nested filter selection', () => {
    expect(toNestedFilterSelection(['option1', 'option2'])).toEqual({
      option1: [],
      option2: [],
    });
  });
});
