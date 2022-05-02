import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { CollapsingContainer } from '../CollapsingContainer';

const TEST_TEXT = 'test content';

const PageTestComponent = ({ ...rest }) => {
  return (
    <CollapsingContainer {...rest}>
      <div>{TEST_TEXT}</div>
    </CollapsingContainer>
  );
};

describe('CollapsingContainer Tests', () => {
  const testInit = async (viewProps?: any) =>
    testRenderer(PageTestComponent, undefined, viewProps);
  it('should render content', async () => {
    await testInit();
    expect(screen.getByText(TEST_TEXT)).toBeInTheDocument();
  });
});
