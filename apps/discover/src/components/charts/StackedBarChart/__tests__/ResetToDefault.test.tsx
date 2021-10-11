import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { EMPTY_STATE_TEXT, RESET_TO_DEFAULT_BUTTON_TEXT } from '../constants';
import { ResetToDefault, Props } from '../ResetToDefault';

describe('ResetToDefault', () => {
  const testInit = (props?: Props) =>
    testRendererModal(ResetToDefault, undefined, props);

  it('should render intital texts', async () => {
    testInit();

    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
    expect(screen.getByText(RESET_TO_DEFAULT_BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should call the callback handleResetToDefault event', async () => {
    const handleResetToDefault = jest.fn();
    testInit({ handleResetToDefault });

    fireEvent.click(screen.getByText(RESET_TO_DEFAULT_BUTTON_TEXT));
    expect(handleResetToDefault).toBeCalledTimes(1);
  });
});
