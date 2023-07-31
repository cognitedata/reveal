/* eslint-disable jest/no-conditional-expect */
import { screen, fireEvent } from '@testing-library/react';

import { AllIconTypes } from '@cognite/cogs.js';

import { testRendererModal } from '__test-utils/renderer';

import { ActionModal, ActionModalProps } from '../ActionModal';

describe('ActionModal Tests', () => {
  const testInit = async (viewProps?: ActionModalProps) =>
    testRendererModal(ActionModal, undefined, viewProps);
  it('should render modal content as expected', async () => {
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
    });
    expect(screen.getByText('TEST')).toBeInTheDocument();
  });
  it('should render actions', async () => {
    const onActoinOneClick = jest.fn();
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
      actions: [
        {
          title: 'ACTION_TITLE_1',
          text: 'ACTION_TEXT_1',
          icon: 'Download' as AllIconTypes,
          onClick: onActoinOneClick,
        },
        {
          title: 'ACTION_TITLE_2',
          text: 'ACTION_TEXT_2',
          icon: 'Download' as AllIconTypes,
          disabled: true,
        },
      ],
    });
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('ACTION_TEXT_1')).toBeInTheDocument();
    expect(screen.getByText('ACTION_TEXT_2')).toBeInTheDocument();

    const actionIconOne = screen.getByTestId('button-ACTION_TEXT_1');
    expect(actionIconOne).toBeEnabled();

    fireEvent.click(actionIconOne);
    expect(onActoinOneClick).toBeCalledTimes(1);

    const actionIconTwo = screen.getByTestId('button-ACTION_TEXT_2');
    expect(actionIconTwo).toBeDisabled();
  });
});
