import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { HorizontalResizableBox } from '../HorizontalResizableBox';

const TEST_TEXT = 'TEST_TEXT';

const onResized = jest.fn();

const ElevationComponent = () => {
  return (
    <HorizontalResizableBox
      width={100}
      minWidth={50}
      maxWidth={150}
      onResize={onResized}
    >
      <div>{TEST_TEXT}</div>
    </HorizontalResizableBox>
  );
};

describe('HorizontalResizableBox Tests', () => {
  const testInit = async (viewProps?: any) =>
    testRenderer(ElevationComponent, undefined, viewProps);
  it('should render content', async () => {
    await testInit();
    expect(screen.getByText(TEST_TEXT)).toBeInTheDocument();
  });
});
