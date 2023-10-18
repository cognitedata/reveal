import { INITIAL_SELECTED_ROWS } from '@data-exploration-lib/core';

import { ResourceSelection } from '../../ResourceSelector';
import { extractResourcesFromSelection } from '../extractResourcesFromSelection';

describe('extractResourcesFromSelection', () => {
  it('should return result correctly', () => {
    const selection: ResourceSelection = {
      ...INITIAL_SELECTED_ROWS,
      asset: {
        0: { id: 0, type: 'asset' },
        1: { id: 1, type: 'asset' },
      },
    };
    const result = extractResourcesFromSelection(selection);
    expect(result).toStrictEqual([
      { id: 0, type: 'asset' },
      { id: 1, type: 'asset' },
    ]);
  });
});
