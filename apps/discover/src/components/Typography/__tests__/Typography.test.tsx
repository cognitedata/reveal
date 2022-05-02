import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Typography } from '../Typography';

const TEST_CONTENT = 'TEST_CONTENT';

const TypographyComponent = () => {
  return (
    <Typography paragraph="h4">
      <span>{TEST_CONTENT}</span>
    </Typography>
  );
};

describe('Tooltip Tests', () => {
  const testInit = async (viewProps?: any) =>
    testRenderer(TypographyComponent, undefined, viewProps);
  it('should render p', async () => {
    await testInit();
    expect(screen.getByText(TEST_CONTENT)).toBeInTheDocument();
  });
});
