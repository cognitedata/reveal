import { beforeEach, describe, expect, test, vi } from 'vitest';
import { InputField } from './InputField';
import { TestInputCommand } from '#test-utils/architecture/commands/TestInputCommand';
import { act, render } from '@testing-library/react';
import { RevealRenderTarget } from '../../architecture';
import { type PropsWithChildren, type ReactElement } from 'react';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';

import userEvent from '@testing-library/user-event';
import assert from 'assert';

const ARBITRARY_PLACEMENT = 'right';

describe(InputField.name, () => {
  let renderTargetMock: RevealRenderTarget;
  let wrapper: (props: PropsWithChildren) => ReactElement;

  beforeEach(() => {
    renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

    wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
    );
  });

  test('should render an empty text field with a post-button by default ', () => {
    const postButtonLabel = 'post-label-text';
    const command = new TestInputCommand({ postButtonLabel });

    const { container } = render(
      <InputField inputCommand={command} placement={ARBITRARY_PLACEMENT} />,
      { wrapper }
    );

    const inputFieldElement = container.querySelector('textarea');
    const buttonElements = container.querySelectorAll('button');

    expect(inputFieldElement).not.toBeNull();
    expect(inputFieldElement?.value).toBe('');

    expect(buttonElements).toHaveLength(1);
    expect(buttonElements[0].textContent).toBe(postButtonLabel);
  });

  test('has the right placeholder text and post- and cancel-button labels', () => {
    const postButtonLabel = 'post-button-label';
    const cancelButtonLabel = 'cancel-button-label';
    const placeholder = 'placeholder-text';

    const command = new TestInputCommand({
      postButtonLabel,
      cancelButtonLabel,
      placeholder
    });

    // In the Cogs Comment-component, the cancel-button won't appear unless an onCancel callback is supplied
    command.onCancel = () => {};

    const { container } = render(
      <InputField inputCommand={command} placement={ARBITRARY_PLACEMENT} />,
      { wrapper }
    );

    const textArea = container.querySelector('textarea');
    const [cancelButton, postButton] = container.querySelectorAll('button');

    expect(textArea?.placeholder).toBe(placeholder);
    expect(postButton.textContent).toBe(postButtonLabel);
    expect(cancelButton.textContent).toBe(cancelButtonLabel);
  });

  test('updates to text content propagates from command to view and the reverse', async () => {
    const textContent = 'text-content';

    const command = new TestInputCommand();
    command.content = textContent;

    const { container } = render(
      <InputField inputCommand={command} placement={ARBITRARY_PLACEMENT} />,
      { wrapper }
    );

    const textArea = container.querySelector('textarea');

    assert(textArea !== null);

    expect(textArea.value).toBe(textContent);

    await act(() => (command.content = ''));

    expect(textArea.value).toBe('');

    await act(async () => {
      await userEvent.type(textArea, textContent);
    });

    expect(textArea.value).toBe(textContent);
  });

  test('pressing post-button invokes command and resets content', async () => {
    const onPost = vi.fn();
    const command = new TestInputCommand({ onInvokeCallback: onPost });
    command.content = 'arbitrary-content';

    const { container } = render(
      <InputField inputCommand={command} placement={ARBITRARY_PLACEMENT} />,
      { wrapper }
    );

    const postButton = container.querySelector('button');

    assert(postButton !== null);

    await act(async () => {
      await userEvent.click(postButton);
    });

    expect(onPost).toHaveBeenCalled();
    expect(command.content).toBe('');
  });

  test('disables post button when enabled-flag is false', () => {
    const command = new TestInputCommand();

    const { container } = render(
      <InputField inputCommand={command} placement={ARBITRARY_PLACEMENT} />,
      { wrapper }
    );

    const postButton = container.querySelector('button');

    assert(postButton !== null);

    expect(postButton.getAttribute('aria-disabled')).toBe('false');

    act(() => {
      command.setPostButtonEnabled(false);
    });

    expect(postButton.getAttribute('aria-disabled')).toBe('true');
  });
});
