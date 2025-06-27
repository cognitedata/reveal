import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type BaseCommand, RevealRenderTarget } from '../../architecture';
import { act, type PropsWithChildren, type ReactElement } from 'react';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { CommandButton } from './CommandButton';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';

// Help page here:  https://bogr.dev/blog/react-testing-intro/

describe(CommandButton.name, () => {
  test('should render with default values', async () => {
    const command = new MockCommand();
    renderCommandButton(command);

    // Check button
    const button = await screen.findByRole('button');
    const label = command.label;
    expect(button.getAttribute('aria-disabled')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe(label);
    expect(button.getAttribute('type')).toBe('button');

    const buttonClass = button.getAttribute('class');
    expect(buttonClass).not.toContain('toggled');
    expect(buttonClass).toContain('type-ghost');
    expect(buttonClass).toContain('icon-only');
    expect(buttonClass).toContain('cogs-button');

    // Check icon
    const icon = await screen.findByLabelText(command.icon + 'Icon');
    expect(icon.getAttribute('aria-label')).toBe(command.icon + 'Icon');
    expect(icon.getAttribute('class')).toContain('cogs-icon');
  });

  test('should invoke when clicked and track count', async () => {
    const command = new MockCommand();
    renderCommandButton(command);
    const button = await screen.findByRole('button');
    expect(command.isInvokedTimes).toBe(0);
    await act(async () => {
      await userEvent.click(button);
    });
    expect(command.isInvokedTimes).toBe(1);
  });

  test('should change from visible to invisible', async () => {
    const command = new MockCommand();
    renderCommandButton(command);

    const beforeButton = await screen.findByRole('button');
    expect(beforeButton.getAttribute('aria-disabled')).toBe('false');

    act(() => {
      command.isVisible = false;
    });
    const afterButton = screen.queryByRole('button');
    expect(afterButton).toBeNull();
  });

  test('should change from enabled to disabled', async () => {
    const command = new MockCommand();
    renderCommandButton(command);

    const beforeButton = await screen.findByRole('button');
    expect(beforeButton.getAttribute('aria-disabled')).toBe('false');

    act(() => {
      command.isEnabled = false;
    });
    const afterButton = await screen.findByRole('button');
    expect(afterButton.getAttribute('aria-disabled')).toBe('true');
  });

  test('should change from unchecked to checked', async () => {
    const command = new MockCommand();
    command.isToggle = true;
    renderCommandButton(command);

    const beforeButton = await screen.findByRole('button');
    expect(beforeButton.getAttribute('class')).not.toContain('toggled');

    await act(async () => {
      await userEvent.click(beforeButton);
    });
    const afterButton = await screen.findByRole('button');
    expect(afterButton.getAttribute('class')).toContain('toggled');
  });

  test('should update icon when changed', async () => {
    const command = new MockCommand();
    renderCommandButton(command);

    const beforeIcon = await screen.findByLabelText(command.icon + 'Icon');
    expect(beforeIcon).not.toBeNull();

    act(() => {
      command.icon = 'Snow';
    });
    const afterIcon = await screen.findByLabelText('SnowIcon');
    expect(afterIcon).not.toBeNull();
  });
});

function renderCommandButton(command: BaseCommand): void {
  const renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
  );
  render(<CommandButton inputCommand={command} placement={'top'} />, {
    wrapper
  });
}
