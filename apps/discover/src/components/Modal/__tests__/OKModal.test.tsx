/* eslint-disable jest/no-conditional-expect */
import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { OKModal, OkModalProps } from '../OKModal';

describe('EntityFeedbackModal Tests', () => {
  const testInit = async (viewProps?: OkModalProps) =>
    testRendererModal(OKModal, undefined, viewProps);
  it('should render modal with OK button as expected', async () => {
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
    });

    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should render modal with `okText` overridden', async () => {
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
      okText: 'TEST_OK',
    });

    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
    expect(screen.getByText('TEST_OK')).toBeInTheDocument();
  });

  it('should call the onOk callback', async () => {
    const onOk = jest.fn();
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
      onOk,
    });

    expect(screen.getByText('TEST')).toBeInTheDocument();
    const okButton = screen.getByText('OK');
    if (okButton) {
      fireEvent.click(okButton);
    }
    expect(onOk).toBeCalledTimes(1);
  });
});
