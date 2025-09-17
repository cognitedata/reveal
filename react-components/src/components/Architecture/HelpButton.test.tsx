import { beforeEach, describe, expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import assert from 'assert';
import { findIconByNameInContainer } from '#test-utils/cogs/findIconByNameInContainer';
import { type PropsWithChildren, type ReactElement } from 'react';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { RevealRenderTarget } from '../../architecture';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { HelpCommand } from '../../architecture/base/concreteCommands/general/HelpCommand';
import { createHelpButton } from './HelpButton';

describe(createHelpButton.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: HelpCommand;
  let wrapper: (props: PropsWithChildren) => ReactElement;

  beforeEach(() => {
    renderTarget = new RevealRenderTarget(viewerMock, sdkMock);
    wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider renderTarget={renderTarget}>{children}</ViewerContextProvider>
    );

    command = new HelpCommand();
  });

  test('should have icon', async () => {
    const { container } = render(createHelpButton(command, PLACEMENT), { wrapper });
    const icon = findIconByNameInContainer(command.icon, container);
    expect(icon).toBeDefined();
  });

  test('should be closed when no click', async () => {
    const { container } = render(createHelpButton(command, PLACEMENT), { wrapper });
    const icon = findIconByNameInContainer(command.icon, container);
    assert(icon !== null);

    expect(command.isChecked).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('should open on click', async () => {
    const { container } = render(createHelpButton(command, PLACEMENT), { wrapper });
    const icon = findIconByNameInContainer(command.icon, container);
    assert(icon !== null);

    fireEvent.click(icon);
    expect(command.isChecked).toBe(true);

    expect(screen.queryByRole('dialog')).toBeDefined();
  });

  test('should close on click when open', async () => {
    const { container } = render(createHelpButton(command, PLACEMENT), { wrapper });
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

const PLACEMENT = 'right';
