import {
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { UndoToast } from '../Undo';

describe('UndoToast', () => {
  const Page = (viewProps?: any) =>
    testRenderer(UndoToast, undefined, viewProps);

  let visible = true;
  const toastText = 'Inner text of undoToast';

  const setVisible = jest.fn((newVal: boolean) => {
    visible = newVal;
  });

  const defaultProps = {
    callback: jest.fn(),
    children: toastText,
    onUndo: jest.fn(),
    setVisible,
    visible,
  };

  it('stops the action from running', async () => {
    Page(defaultProps);

    await screen.findByText(toastText);

    fireEvent.click(await screen.findByText('Undo'));

    await waitForElementToBeRemoved(() => screen.queryByText(toastText), {
      timeout: 2000,
    });

    expect(defaultProps.onUndo).toBeCalled();
    expect(defaultProps.onUndo).toHaveBeenCalledTimes(1);

    expect(defaultProps.callback).not.toBeCalled();
  });
});
