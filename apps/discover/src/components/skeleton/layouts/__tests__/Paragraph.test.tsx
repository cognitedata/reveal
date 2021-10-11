import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Paragraph, Props } from '../Paragraph';

describe('Paragraph Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(Paragraph, undefined, viewProps);
  it('should render 10 rows', async () => {
    await testInit({
      lines: 10,
    });
    expect(screen.getAllByRole('row')).toHaveLength(10);
  });
});
