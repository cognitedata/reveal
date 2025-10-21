import { assert, describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
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
import { OptionType } from '../../architecture/base/commands/BaseOptionCommand';
import { SegmentedButtons } from './SegmentedButtons';
import userEvent from '@testing-library/user-event';
import {
  getButtonsInContainer,
  getLabel,
  isEnabled,
  isSelected,
  isToggled
} from '#test-utils/cogs/htmlTestUtils';

describe(SegmentedButtons.name, () => {
  test('should render with default values', () => {
    const command = new MockSegmentedCommand();
    const container = renderSegmentedButtons(command);

    assert(command.children !== undefined);

    // Check button
    const buttons = getButtonsInContainer(container);
    expect(buttons.length).toBe(2);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const option = command.children[i];

      expect(isEnabled(button)).toBe(true);
      expect(getLabel(button)).toBe(option.label);
      expect(isSelected(button)).toBe(option.isChecked);
      expect(isToggled(button)).toBe(false);
    }
  });

  test('should change from visible to invisible', () => {
    const command = new MockSegmentedCommand();
    const container = renderSegmentedButtons(command);

    const beforeButtons = getButtonsInContainer(container);
    expect(beforeButtons.length).toBe(2);

    act(() => {
      command.isVisible = false;
    });
    const afterButtons = getButtonsInContainer(container);
    expect(afterButtons.length).toBe(0);
  });

  test('should change from enabled to disabled', () => {
    const command = new MockSegmentedCommand();
    const container = renderSegmentedButtons(command);

    const beforeButtons = getButtonsInContainer(container);
    expect(beforeButtons.length).toBe(2);
    for (const button of beforeButtons) {
      expect(isEnabled(button)).toBe(true);
    }

    act(() => {
      command.isEnabled = false;
    });

    const afterButtons = getButtonsInContainer(container);
    expect(afterButtons.length).toBe(2);
    for (const button of afterButtons) {
      expect(isEnabled(button)).toBe(false);
    }
  });

  test('should select the second option', async () => {
    const command = new MockSegmentedCommand();
    const container = renderSegmentedButtons(command);

    assert(command.children !== undefined);
    const beforeButtons = getButtonsInContainer(container);
    expect(beforeButtons.length).toBe(2);
    expect(isSelected(beforeButtons[0])).toBe(true);
    expect(isSelected(beforeButtons[1])).toBe(false);

    expect(command.children[0].isChecked).toBe(true);
    expect(command.children[1].isChecked).toBe(false);

    await act(async () => {
      await userEvent.click(beforeButtons[1]);
    });

    const afterButtons = getButtonsInContainer(container);
    expect(afterButtons.length).toBe(2);
    expect(isSelected(afterButtons[0])).toBe(false);
    expect(isSelected(afterButtons[1])).toBe(true);

    expect(command.children[0].isChecked).toBe(false);
    expect(command.children[1].isChecked).toBe(true);
  });
});

function renderSegmentedButtons(command: BaseOptionCommand): HTMLElement {
  const renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContextProvider renderTarget={renderTargetMock}>{children}</ViewerContextProvider>
  );
  const { container } = render(<SegmentedButtons inputCommand={command} placement={'top'} />, {
    wrapper
  });
  return container;
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
