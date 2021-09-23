import { screen } from '@testing-library/react';
import { testRenderer } from '__test_utils__/testRenderer';

import { Richtext } from '../Richtext';

describe('Richtext', () => {
  it('should be ok in good case', () => {
    testRenderer(Richtext, {
      readOnly: true,
      initialValue: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'test-value',
            },
          ],
        },
      ],
    });

    expect(screen.getByText('test-value')).toBeInTheDocument();
  });
});
