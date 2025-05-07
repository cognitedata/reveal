import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type BaseCommand, RevealRenderTarget } from '../../architecture';
import { type PropsWithChildren, type ReactElement } from 'react';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { Translator } from '../i18n/Translator';
import { CommandButton } from './CommandButton';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';

// Help page here:  https://bogr.dev/blog/react-testing-intro/

describe(CommandButton.name, () => {
  afterEach(() => {
    cleanup();
  });

  test('should render by default values', async () => {
    const command = new MockCommand();
    renderMe(command);

    // Check button
    const button = await screen.findByRole('button');
    const label = command.getLabel(Translator.instance.translate);
    expect(button.getAttribute('aria-disabled')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe(label);
    expect(button.getAttribute('type')).toBe('button');

    const buttonClass = button.getAttribute('class');
    expect(buttonClass).not.contains('toggled');
    expect(buttonClass).contains('type-ghost');
    expect(buttonClass).contains('icon-only');
    expect(buttonClass).contains('cogs-button');

    // Check icon
    const icon = await screen.findByLabelText(command.icon + 'Icon');
    expect(icon.getAttribute('aria-label')).toBe(command.icon + 'Icon');
    expect(icon.getAttribute('class')).contains('cogs-icon');
  });

  test('should invoke when clicked', async () => {
    const command = new MockCommand();
    renderMe(command);
    const button = await screen.findByRole('button');
    expect(command.isInvokedTimes).toBe(0);
    fireEvent.click(button);
    expect(command.isInvokedTimes).toBe(1);
  });

  test('should be invisible', async () => {
    const command = new MockCommand();
    command.isVisible = false;

    renderMe(command);
    const afterButton = screen.queryByRole('button');
    expect(afterButton).toBeNull();
  });

  test('should change from enabled to disabled', async () => {
    const command = new MockCommand();
    renderMe(command);

    const beforeButton = await screen.findByRole('button');
    expect(beforeButton.getAttribute('aria-disabled')).toBe('false');

    command.isEnabled = false;

    const afterButton = await screen.findByRole('button');
    expect(afterButton.getAttribute('aria-disabled')).toBe('true');
  });

  test('should change from unchecked to checked', async () => {
    const command = new MockCommand();
    command.isToggle = true;
    renderMe(command);

    const beforeButton = await screen.findByRole('button');
    expect(beforeButton.getAttribute('class')).not.contains('toggled');

    fireEvent.click(beforeButton);

    const afterButton = await screen.findByRole('button');
    expect(afterButton.getAttribute('class')).contains('toggled');
  });

  test('should change icon', async () => {
    const command = new MockCommand();
    renderMe(command);

    const beforeIcon = await screen.findByLabelText(command.icon + 'Icon');
    expect(beforeIcon).not.toBeNull();

    command.icon = 'Snow';

    const afterIcon = await screen.findByLabelText('SnowIcon');
    expect(afterIcon).not.toBeNull();
  });
});

function renderMe(command: BaseCommand): void {
  const renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
  );
  render(<CommandButton inputCommand={command} placement={'top'} />, {
    wrapper
  });
}
