import { type ReactElement, type PropsWithChildren } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { createCustomInputField, CustomInputField } from './CustomInputField';
import { render } from '@testing-library/react';
import { RevealRenderTarget, type TranslationInput } from '../../architecture';
import { CustomBaseInputCommand } from '../../architecture/base/commands/CustomBaseInputCommand';
import { ViewerContext } from '../RevealCanvas/ViewerContext';
import { createViewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  CustomInputFieldContext,
  defaultCustomInputFieldDependencies
} from './CustomInputField.context';
import { translate } from '../../architecture/base/utilities/translation/translateUtils';

describe(CustomInputField.name, () => {
  const mockDependencies = getMocksByDefaultDependencies(defaultCustomInputFieldDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContext.Provider value={new RevealRenderTarget(createViewerMock(), sdkMock)}>
      <CustomInputFieldContext.Provider value={mockDependencies}>
        {children}
      </CustomInputFieldContext.Provider>
    </ViewerContext.Provider>
  );

  test('renders nothing on empty input command', () => {
    const command = new TestCustomBaseInputCommand();

    const { container } = render(createCustomInputField(command, 'left'), { wrapper });

    expect(container.children[0].children).toHaveLength(0);
  });

  test('renders input field properly', () => {
    const text = 'Input field value';
    const command = new TestCustomBaseInputCommand();
    command.contents.push({ type: 'text', content: text });

    render(createCustomInputField(command, 'left'), { wrapper });

    expect(mockDependencies.Input).toHaveBeenCalledWith(
      {
        placeholder: undefined,
        disabled: false,
        value: text,
        onChange: expect.any(Function)
      },
      expect.anything()
    );
  });

  test('renders comment input properly', () => {
    const command = new TestCustomBaseInputCommand();
    const text = 'text value in comment field';
    command.contents.push({ type: 'comment', content: text });

    render(createCustomInputField(command, 'left'), { wrapper });

    expect(mockDependencies.Textarea).toHaveBeenCalledWith(
      {
        placeholder: undefined,
        value: text,
        onChange: expect.any(Function)
      },
      expect.anything()
    );
  });

  test('renders custom input properly', () => {
    const command = new TestCustomBaseInputCommand();
    const CustomComponent = vi.fn();
    command.contents.push({ type: 'customInput', content: <CustomComponent /> });

    render(createCustomInputField(command, 'left'), { wrapper });

    expect(CustomComponent).toHaveBeenCalled();
  });

  test('renders submit buttons properly', () => {
    const command = new TestCustomBaseInputCommand();
    command.contents.push({ type: 'submitButtons', content: undefined });

    render(createCustomInputField(command, 'left'), { wrapper });

    expect(mockDependencies.Button).toHaveBeenCalledTimes(2);
    expect(mockDependencies.Button).toHaveBeenNthCalledWith(
      1,
      {
        type: 'secondary',
        disabled: false,
        onClick: expect.any(Function),
        children: translate(command.getCancelButtonLabel())
      },
      expect.anything()
    );
    expect(mockDependencies.Button).toHaveBeenNthCalledWith(
      2,
      {
        type: 'primary',
        disabled: true,
        onClick: expect.any(Function),
        children: translate(command.getPostButtonLabel())
      },
      expect.anything()
    );
  });

  test('renders comment field with buttons properly', () => {
    const command = new TestCustomBaseInputCommand();
    const text = 'placeholder text';
    command.contents.push({ type: 'commentWithButtons', content: text });

    render(createCustomInputField(command, 'left'), { wrapper });

    expect(mockDependencies.Comment).toHaveBeenCalledWith(
      {
        placeholder: undefined,
        message: text,
        setMessage: expect.any(Function),
        onPostMessage: expect.any(Function),
        postButtonText: translate(command.getPostButtonLabel()),
        postButtonDisabled: true,
        cancelButtonText: translate(command.getCancelButtonLabel()),
        cancelButtonDisabled: false,
        onCancel: command.onCancel,
        showButtons: true
      },
      expect.anything()
    );
  });
});

class TestCustomBaseInputCommand extends CustomBaseInputCommand {
  getPostButtonLabel(): TranslationInput {
    return { untranslated: 'post button label' };
  }

  override getCancelButtonLabel(): TranslationInput {
    return { untranslated: 'cancel button label' };
  }

  getPlaceholderByIndex(index: number): TranslationInput | undefined {
    return this._placeholders?.[index];
  }

  getAllPlaceholders(): TranslationInput[] | undefined {
    return this._placeholders;
  }
}
