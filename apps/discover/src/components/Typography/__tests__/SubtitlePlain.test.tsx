import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SubtitlePlain } from '../SubtitlePlain';

const TEST_CONTENT = 'TEST_CONTENT';

describe('SubtitlePlain', () => {
  it('should be ok in good case', () => {
    testRenderer(() => <SubtitlePlain>{TEST_CONTENT}</SubtitlePlain>);
    expect(screen.getByText(TEST_CONTENT)).toBeInTheDocument();
    expect(screen.getByRole('doc-subtitle')).toBeInTheDocument();
  });

  it('should be ok in null case', () => {
    testRenderer(() => <SubtitlePlain />);
    expect(screen.queryByRole('doc-subtitle')).not.toBeInTheDocument();
  });
});
