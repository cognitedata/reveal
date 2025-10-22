import { assert, beforeEach, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe(SegmentedButtons.name, () => {
  let command: MockSegmentedCommand;
  let container: HTMLElement;

  beforeEach(() => {
    command = new MockSegmentedCommand();
    container = renderSegmentedButtons(command).container;
  });

  test('should render with default values', () => {
    assert(command.children !== undefined);

    expect(container.innerHTML).not.toBe('');

    const allElements = container.querySelectorAll('*');

    expect(allElements.length).toBeGreaterThan(0);
  });

  test('should change from visible to invisible', () => {
    const beforeButtons = container.querySelectorAll('button');
    expect(beforeButtons.length).toBe(2);

    act(() => {
      command.isVisible = false;
    });
    const afterButtons = container.querySelectorAll('button');
    expect(afterButtons.length).toBe(0);
  });

  test('should change from enabled to disabled', () => {
    const beforeButtons = container.querySelectorAll('button');
    expect(beforeButtons.length).toBe(2);
    for (const button of beforeButtons) {
      expect(button.getAttribute('aria-disabled')).toBe('false');
    }

    act(() => {
      command.isEnabled = false;
    });

    const afterButtons = container.querySelectorAll('button');
    expect(afterButtons.length).toBe(2);
    for (const button of afterButtons) {
      expect(button.getAttribute('aria-disabled')).toBe('true');
    }
  });

  test('should select the second option', async () => {
    assert(command.children !== undefined);
    const beforeButtons = container.querySelectorAll('button');
    expect(beforeButtons.length).toBe(2);
    expect(beforeButtons[0].getAttribute('aria-selected')).toBe('true');
    expect(beforeButtons[1].getAttribute('aria-selected')).toBe('false');

    expect(command.children[0].isChecked).toBe(true);
    expect(command.children[1].isChecked).toBe(false);

    await act(async () => {
      await userEvent.click(beforeButtons[1]);
    });

    const afterButtons = container.querySelectorAll('button');
    expect(afterButtons.length).toBe(2);
    expect(afterButtons[0].getAttribute('aria-selected')).toBe('false');
    expect(afterButtons[1].getAttribute('aria-selected')).toBe('true');

    expect(command.children[0].isChecked).toBe(false);
    expect(command.children[1].isChecked).toBe(true);
  });
});

function renderSegmentedButtons(command: BaseOptionCommand): { container: HTMLElement } {
  const renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContextProvider renderTarget={renderTargetMock}>{children}</ViewerContextProvider>
  );
  const { container } = render(<SegmentedButtons inputCommand={command} placement={'top'} />, {
    wrapper
  });
  return { container };
}

class MockSegmentedCommand extends BaseOptionCommand {
  public _isVisible = true;
  public _isEnabled = true;
  public selectedValue: number = 1;
  private _optionCommands: OptionCommand[] = [];

  public constructor() {
    super(OptionType.Segmented);
    this._optionCommands = [new OptionCommand(this, 1), new OptionCommand(this, 2)];
  }

  protected override createChildren(): BaseCommand[] {
    return this._optionCommands;
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
