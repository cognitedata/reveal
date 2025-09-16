import { beforeEach, describe, expect, test } from 'vitest';
import { SettingsButton } from './SettingsButton';
import { fireEvent, render, screen } from '@testing-library/react';
import { findIconByNameInContainer } from '#test-utils/cogs/findIconByNameInContainer';
import assert from 'assert';
import { type PropsWithChildren, type ReactElement } from 'react';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { RevealRenderTarget } from '../../architecture';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { HelpCommand } from '../../architecture/base/concreteCommands/general/HelpCommand';
import { HelpButton } from './HelpButton';

let wrapper: (props: PropsWithChildren) => ReactElement;

describe(SettingsButton.name, () => {
  let renderTargetMock: RevealRenderTarget;
  let command: HelpCommand;
  beforeEach(() => {
    renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);
    wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider renderTarget={renderTargetMock}>{children}</ViewerContextProvider>
    );

    command = new HelpCommand();
  });

  test('should have icon', async () => {
    const { container } = render(<HelpButton inputCommand={command} placement="right" />, {
      wrapper
    });
    const icon = findIconByNameInContainer(command.icon, container);
    expect(icon).toBeDefined();
  });

  test('should be closed when no click', async () => {
    const { container } = render(<HelpButton inputCommand={command} placement="right" />, {
      wrapper
    });
    const icon = findIconByNameInContainer(command.icon, container);
    assert(icon !== null);

    expect(command.isChecked).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('should open on click', async () => {
    const { container } = render(<HelpButton inputCommand={command} placement="right" />, {
      wrapper
    });
    const icon = findIconByNameInContainer(command.icon, container);
    assert(icon !== null);

    fireEvent.click(icon);
    expect(command.isChecked).toBe(true);

    expect(screen.queryByRole('dialog')).toBeDefined();
  });

  test('should close on when open', async () => {
    const { container } = render(<HelpButton inputCommand={command} placement="right" />, {
      wrapper
    });
    const icon = findIconByNameInContainer(command.icon, container);
    assert(icon !== null);

    fireEvent.click(icon);
    expect(command.isChecked).toBe(true);
    expect(screen.queryByRole('dialog')).toBeDefined();

    fireEvent.click(icon);
    expect(command.isChecked).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
