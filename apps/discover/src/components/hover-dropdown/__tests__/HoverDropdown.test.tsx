import { screen } from '@testing-library/react';

import { Menu, Button } from '@cognite/cogs.js';

import { testRenderer } from '__test-utils/renderer';

import { HoverDropdown } from '../HoverDropdown';

const TEST_TEXT = 'TEST_TEXT';

const ElevationComponent = () => {
  return (
    <HoverDropdown
      content={
        <Menu>
          <Menu.Item>{TEST_TEXT}</Menu.Item>
        </Menu>
      }
    >
      <Button data-testid="menu-button" />
    </HoverDropdown>
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
