import { screen, fireEvent } from '@testing-library/react';
import {
  DEFAULT_MOCKED_SAVED_SEARCH_NAME,
  getMockedEmptySavedSearch,
} from 'services/savedSearches/__fixtures/savedSearch';

import { testRendererModal } from '__test-utils/renderer';

import {
  DeleteSavedSearchModal,
  Props,
  getModalText,
} from '../DeleteSavedSearchModal';

describe('DeleteSavedSearchModal', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onCancel,
    onConfirm,
    item: getMockedEmptySavedSearch(),
  };

  const renderModal = async (props: Props) => {
    return { ...testRendererModal(DeleteSavedSearchModal, undefined, props) };
  };

  it('should display modal with saved search name', async () => {
    await renderModal(defaultProps);
    const modalText = getModalText(DEFAULT_MOCKED_SAVED_SEARCH_NAME);

    expect(screen.getByText(modalText)).toBeInTheDocument();
  });

  it('should call `onCancel` once when clicked the cancel button', async () => {
    await renderModal(defaultProps);

    fireEvent.click(screen.getByTestId('cancel-delete-saved-search'));
    expect(onCancel).toBeCalledTimes(1);
  });

  it('should call `onConfirm` once when clicked the delete button', async () => {
    await renderModal(defaultProps);

    fireEvent.click(screen.getByTestId('confirm-delete-saved-search'));
    expect(onConfirm).toBeCalledTimes(1);
  });
});
