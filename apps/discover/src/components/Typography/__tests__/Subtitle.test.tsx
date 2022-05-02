import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Subtitle } from '../Subtitle';

const TEST_CONTENT = 'TEST_CONTENT';

describe('Subtitle', () => {
  const testInit = async () =>
    testRenderer(() => (
      <Subtitle>
        <strong>{TEST_CONTENT}</strong>
      </Subtitle>
    ));

  it('should be ok in good case', () => {
    testInit();
    expect(screen.getByText(TEST_CONTENT)).toBeInTheDocument();
  });
});
