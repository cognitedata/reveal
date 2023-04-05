import { getFilterButtonText } from '../getFilterButtonText';

describe('NestedFilter/getFilterButtonText', () => {
  it('should return placeholder', () => {
    expect(getFilterButtonText({})).toEqual('Select...');
  });

  it('should return text correctly', () => {
    expect(getFilterButtonText({ parent: [] })).toEqual('Selected: 1');
    expect(getFilterButtonText({ parent: ['child'] })).toEqual('Selected: 1');
    expect(getFilterButtonText({ parent1: [], parent2: ['child'] })).toEqual(
      'Selected: 2'
    );
  });
});
