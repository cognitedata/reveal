/* eslint-disable jest/no-conditional-expect */
import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import {
  WARNING_MODAL_EXPLANATION,
  WARNING_MODAL_QUESTION,
  WARNING_MODAL_TITLE,
} from '../constants';
import { WarningModal3D, Props } from '../WarningModal3D';

describe('WarningModal Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRendererModal(WarningModal3D, undefined, viewProps);
  it('should render modal with title as expected', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await testInit({
      show3dWarningModal: true,
      onConfirm,
      onCancel,
    });

    expect(screen.getByText(WARNING_MODAL_TITLE)).toBeInTheDocument();
    expect(screen.getByText(WARNING_MODAL_EXPLANATION)).toBeInTheDocument();
    expect(screen.getByText(WARNING_MODAL_QUESTION)).toBeInTheDocument();
  });

  it('should call the onOk callback', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await testInit({
      show3dWarningModal: true,
      onConfirm,
      onCancel,
    });

    const okButton = screen.getByText('Proceed');
    if (okButton) {
      fireEvent.click(okButton);
    }
    expect(onConfirm).toBeCalledTimes(1);
  });

  it('should call the onCancel callback', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await testInit({
      show3dWarningModal: true,
      onConfirm,
      onCancel,
    });

    const cancelButton = screen.getByText('Cancel');
    if (cancelButton) {
      fireEvent.click(cancelButton);
    }
    expect(onCancel).toBeCalledTimes(1);
  });
});
