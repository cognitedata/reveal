import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { OVERWRITE_SEARCH_MODAL_TEXT } from '../../constants';
import { OverwriteSearchModal, Props } from '../OverwriteSearchModal';

describe('OverwriteSearchModal Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRendererModal(OverwriteSearchModal, undefined, viewProps);
  it('should render modal', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await testInit({
      onConfirm,
      onCancel,
      isOpen: true,
    });
    expect(screen.getByText(OVERWRITE_SEARCH_MODAL_TEXT)).toBeInTheDocument();
  });
  it('should call confirm callback', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await testInit({
      onConfirm,
      onCancel,
      isOpen: true,
    });
    fireEvent.click(screen.getByText('Overwrite search'));
    expect(onConfirm).toBeCalledTimes(1);
  });
  it('should call cancel callback', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await testInit({
      onConfirm,
      onCancel,
      isOpen: true,
    });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toBeCalledTimes(1);
  });
});
