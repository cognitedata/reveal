import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Divider } from '../Divider';

const DividerComponent = () => {
  return <Divider data-testid="divider" />;
};

describe('Divider Tests', () => {
  const testInit = async () => testRenderer(DividerComponent);
  it('should render content', async () => {
    await testInit();
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });
});
