import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { GreyBadge } from '../GreyBadge';

const TEST_TEXT = 'TEST_TEXT';

const GrayBadgeComponent = () => {
  return <GreyBadge text={TEST_TEXT} />;
};

describe('GreyBadge Tests', () => {
  const testInit = async () => testRenderer(GrayBadgeComponent);
  it('should render content', async () => {
    await testInit();
    expect(screen.getByText(TEST_TEXT)).toBeInTheDocument();
  });
});
