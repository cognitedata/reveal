import { afterEach, assert, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import {
  BaseCommand,
  BaseOptionCommand,
  RevealRenderTarget,
  type TranslationInput
} from '../../architecture';
import { act, type PropsWithChildren, type ReactElement } from 'react';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { CommandButton } from './CommandButton';
import { translate } from '../../architecture/base/utilities/translateUtils';
import { OptionType } from '../../architecture/base/commands/BaseOptionCommand';
import { SegmentedButtons } from './SegmentedButtons';
import userEvent from '@testing-library/user-event';

// Help page here:  https://bogr.dev/blog/react-testing-intro/

const TEST_ID = 'segmented-control-button';

describe(CommandButton.name, () => {
  afterEach(() => {
    cleanup();
  });

  test('should render with default values', async () => {
    const command = new MockSegmentedCommand();
    renderMe(command);

    assert(command.children !== undefined);

    // Check button
    const buttons = screen.queryAllByTestId(TEST_ID);
    expect(buttons.length).toBe(2);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const option = command.children[i];

      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-disabled')).toBe('false');
      expect(button.getAttribute('aria-label')).toBe(option.getLabel(translate));
      expect(button.getAttribute('aria-selected')).toBe(option.isChecked.toString());

      const buttonClass = button.getAttribute('class');
      expect(buttonClass).not.contains('toggled');
    }
  });

  test('should change from visible to invisible', async () => {
    const command = new MockSegmentedCommand();
    renderMe(command);

    const beforeButtons = screen.queryAllByTestId(TEST_ID);
    expect(beforeButtons.length).toBe(2);

    act(() => {
      command.isVisible = false;
    });
    const afterButtons = screen.queryAllByTestId(TEST_ID);
    expect(afterButtons.length).toBe(0);
  });

  test('should change from enabled to disabled', async () => {
    const command = new MockSegmentedCommand();
    renderMe(command);

    const beforeButtons = screen.queryAllByTestId(TEST_ID);
    expect(beforeButtons.length).toBe(2);
    for (const button of beforeButtons) {
      expect(button.getAttribute('aria-disabled')).toBe('false');
    }

    act(() => {
      command.isEnabled = false;
    });

    const afterButtons = screen.queryAllByTestId(TEST_ID);
    expect(afterButtons.length).toBe(2);
    for (const button of afterButtons) {
      expect(button.getAttribute('aria-disabled')).toBe('true');
    }
  });

  test('should select the second option', async () => {
    const command = new MockSegmentedCommand();
    renderMe(command);

    assert(command.children !== undefined);
    const beforeButtons = screen.queryAllByTestId(TEST_ID);
    expect(beforeButtons.length).toBe(2);
    expect(beforeButtons[0].getAttribute('aria-selected')).toBe('true');
    expect(beforeButtons[1].getAttribute('aria-selected')).toBe('false');

    expect(command.children[0].isChecked).toBe(true);
    expect(command.children[1].isChecked).toBe(false);

    await act(async () => {
      await userEvent.click(beforeButtons[1]);
    });

    const afterButtons = screen.queryAllByTestId(TEST_ID);
    expect(afterButtons.length).toBe(2);
    expect(afterButtons[0].getAttribute('aria-selected')).toBe('false');
    expect(afterButtons[1].getAttribute('aria-selected')).toBe('true');

    expect(command.children[0].isChecked).toBe(false);
    expect(command.children[1].isChecked).toBe(true);
  });
});

function renderMe(command: BaseOptionCommand): void {
  const renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
  );
  render(<SegmentedButtons inputCommand={command} placement={'top'} />, {
    wrapper
  });
}

class MockSegmentedCommand extends BaseOptionCommand {
  public _isVisible = true;
  public _isEnabled = true;
  public selectedValue: number = 1;
  public constructor() {
    super(OptionType.Segmented);
    this.add(new OptionCommand(this, 1));
    this.add(new OptionCommand(this, 2));
  }

  public override get isEnabled(): boolean {
    return this._isEnabled;
  }

  public override set isEnabled(value: boolean) {
    this._isEnabled = value;
    this.update();
  }

  public override get isVisible(): boolean {
    return this._isVisible;
  }

  public override set isVisible(value: boolean) {
    this._isVisible = value;
    this.update();
  }
}

class OptionCommand extends BaseCommand {
  public readonly parent: MockSegmentedCommand;
  public readonly value: number;

  public constructor(parent: MockSegmentedCommand, value: number) {
    super();
    this.parent = parent;
    this.value = value;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: `Option ${this.value}` };
  }

  public override get icon(): string {
    return 'Snow';
  }

  public override get isEnabled(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.parent.selectedValue === this.value;
  }

  public override invokeCore(): boolean {
    if (this.parent.selectedValue === this.value) {
      return false; // Already selected
    }
    this.parent.selectedValue = this.value;
    this.parent.update();
    return true;
  }
}
