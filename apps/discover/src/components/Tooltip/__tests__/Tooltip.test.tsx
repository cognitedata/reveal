import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Tooltip } from '../Tooltip';

const TEST_TITLE = 'TEST_TITLE';
const TEST_CONTENT = 'TEST_CONTENT';

const TooltipComponent = () => {
  return (
    <Tooltip title={TEST_TITLE} placement="top">
      <span>{TEST_CONTENT}</span>
    </Tooltip>
  );
};

describe('Tooltip Tests', () => {
  const testInit = async () => testRenderer(TooltipComponent);
  it('should render tooltip', async () => {
    await testInit();

    const contant = screen.getByText(TEST_CONTENT);
    expect(contant).toBeInTheDocument();

    fireEvent.mouseEnter(contant, { bubbles: true });
    await screen.findByText(TEST_TITLE);
  });
});
