import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Text, Props } from '../Text';

describe('Paragraph Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(Text, undefined, viewProps);
  it('should render component with currentLine', async () => {
    await testInit({
      currentLine: 2,
    });
    expect(screen.getByRole('row')).toBeInTheDocument();
    expect(screen.getByRole('row')).toHaveAttribute(
      'width',
      '65.99999999999999%'
    );
  });
  it('should render component with isLastLine', async () => {
    await testInit({
      isLastLine: true,
    });
    expect(screen.getByRole('row')).toBeInTheDocument();
    expect(screen.getByRole('row')).toHaveAttribute('width', '30%');
  });
  it('should render component with isOnlyLine', async () => {
    await testInit({
      isOnlyLine: true,
    });
    expect(screen.getByRole('row')).toBeInTheDocument();
    expect(screen.getByRole('row')).toHaveAttribute('width', '35%');
  });
});
