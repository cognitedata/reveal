import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RevealRenderTarget } from '../../architecture';
import { type PropsWithChildren, type ReactElement } from 'react';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { DropdownButton } from './DropdownButton';
import { MockEnumOptionCommand } from '../../../tests/tests-utilities/architecture/mock-commands/MockEnumOptionCommand';

// Help page here:  https://bogr.dev/blog/react-testing-intro/

describe(DropdownButton.name + ' (not used in settings)', () => {
  let renderTargetMock: RevealRenderTarget;
  let testCommand: MockEnumOptionCommand;

  beforeEach(() => {
    renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
    );
    testCommand = new MockEnumOptionCommand();
    render(<DropdownButton inputCommand={testCommand} placement={'top'} usedInSettings={false} />, {
      wrapper
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('should render with correct default value and no dropdown', async () => {
    const label = testCommand.getLabel();
    const button = screen.getByLabelText(label);

    // Check that the selected value is updated by the default value
    const expectedValue = 'Red';
    expect(testCommand.value).toBe(expectedValue);
    expect(button.textContent).toBe(expectedValue);

    // Check that the the option menu is closed

    const menuItems = screen.queryAllByRole('menuitem'); // this doesn't crash when nothing found
    expect(menuItems).toHaveLength(0);
  });

  test('should click and open dropdown menu', async () => {
    const label = testCommand.getLabel();
    fireEvent.click(screen.getByLabelText(label));

    // Check that the menu is open and selected is checked
    const menuItems = await screen.findAllByRole('menuitem');
    expect(menuItems).toHaveLength(3);
    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i];
      expect(menuItem.getAttribute('aria-checked')).toBe(i === 0 ? 'true' : 'false');
    }
  });

  test('should select by dropdown menu and close', async () => {
    const label = testCommand.getLabel();
    fireEvent.click(screen.getByLabelText(label));

    const menuItemsBeforeClick = await screen.findAllByRole('menuitem');
    fireEvent.click(menuItemsBeforeClick[2]); // Select the third option

    // Check that the menu is closed after selection
    const menuItemsAfterClick = screen.queryAllByRole('menuitem');
    expect(menuItemsAfterClick).toHaveLength(0);

    // Check that the selected value is updated
    const expectedValue = 'Blue';
    expect(testCommand.value).toBe(expectedValue);
    expect(screen.getByLabelText(label).textContent).toBe(expectedValue);
  });
});
