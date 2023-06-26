import { mockTFunction } from '@data-exploration-lib/core';

import { getFilterButtonText } from '../getFilterButtonText';

describe('NestedFilter/getFilterButtonText', () => {
  it('should return placeholder', () => {
    expect(getFilterButtonText({}, mockTFunction)).toEqual('Select...');
  });

  it('should return text correctly', () => {
    expect(getFilterButtonText({ parent: [] }, mockTFunction)).toEqual(
      'Selected: 1'
    );
    expect(getFilterButtonText({ parent: ['child'] }, mockTFunction)).toEqual(
      'Selected: 1'
    );
    expect(
      getFilterButtonText({ parent1: [], parent2: ['child'] }, mockTFunction)
    ).toEqual('Selected: 2');
  });
});
