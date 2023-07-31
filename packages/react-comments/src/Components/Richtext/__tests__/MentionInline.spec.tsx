import { screen } from '@testing-library/react';
import { testRenderer } from '__test_utils__/testRenderer';

import { MentionInline } from '../MentionInline';

describe('MentionInline', () => {
  it('should be ok in good case', () => {
    const TEST_DISPLAY_NAME = 'Test display name';
    const TEST_CHILDREN_TEXT = 'Test children text';
    const Usage = () => (
      <MentionInline
        element={{
          type: 'mention',
          id: '1',
          children: [],
          display: TEST_DISPLAY_NAME,
        }}
      >
        <div>{TEST_CHILDREN_TEXT}</div>
      </MentionInline>
    );
    testRenderer(Usage);
    expect(screen.getByText(TEST_DISPLAY_NAME)).toBeInTheDocument();
    expect(screen.getByText(TEST_CHILDREN_TEXT)).toBeInTheDocument();
  });
});
