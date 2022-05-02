/* eslint-disable jest/no-conditional-expect */
import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { WarningModal, WarningModalProps } from '../WarningModal';

describe('WarningModal Tests', () => {
  const testInit = async (viewProps?: WarningModalProps) =>
    testRendererModal(WarningModal, undefined, viewProps);
  it('should render modal with Proceed and Cancel buttons as expected', async () => {
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
    });

    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('Proceed')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should render modal with `okText` can `cancelText` overridden', async () => {
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
      okText: 'TEST_OK',
      cancelText: 'TEST_CANCEL',
    });

    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.queryByText('Proceed')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.getByText('TEST_OK')).toBeInTheDocument();
    expect(screen.getByText('TEST_CANCEL')).toBeInTheDocument();
  });

  it('should call the onOk callback', async () => {
    const onOk = jest.fn();
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
      onOk,
    });

    expect(screen.getByText('TEST')).toBeInTheDocument();
    const okButton = screen.getByText('Proceed');
    if (okButton) {
      fireEvent.click(okButton);
    }
    expect(onOk).toBeCalledTimes(1);
  });

  it('should call the onCancel callback', async () => {
    const onCancel = jest.fn();
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
      onCancel,
    });

    expect(screen.getByText('TEST')).toBeInTheDocument();
    const cancelButton = screen.getByText('Cancel');
    if (cancelButton) {
      fireEvent.click(cancelButton);
    }
    expect(onCancel).toBeCalledTimes(1);
  });
});
