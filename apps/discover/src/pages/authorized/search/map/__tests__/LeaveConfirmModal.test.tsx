import { screen, act, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { LeaveConfirmModal, Props } from '../LeaveConfirmModal';

const onOk = jest.fn();
const onCancel = jest.fn();

const defaultProps = {
  onOk,
  onCancel,
  open: true,
};

describe('Leave confirmation modal', () => {
  const page = (viewStore: Store, props: Props) =>
    testRendererModal(LeaveConfirmModal, viewStore, props);

  const defaultTestInit = async (props: Props) => {
    const store = getMockedStore();

    return { ...page(store, props), store };
  };

  it(`should display modal`, async () => {
    await act(async () => {
      await defaultTestInit(defaultProps);
      const headerText = screen.getByTestId('drawing-mode-leave-confirmation');
      expect(headerText).toBeInTheDocument();
    });
  });

  it(`should close modal`, async () => {
    await act(async () => {
      await defaultTestInit({
        ...defaultProps,
        open: false,
      });
      const headerText = screen.queryByTestId(
        'drawing-mode-leave-confirmation'
      );
      expect(headerText).not.toBeInTheDocument();
    });
  });

  it(`should trigger callback on cancel button click`, async () => {
    await act(async () => {
      await defaultTestInit(defaultProps);
      const button = screen.getByTestId('map-leave-modal-cancel-btn');
      fireEvent.click(button);
      expect(onCancel).toBeCalledTimes(1);
    });
  });

  it(`should trigger callback on ok button click`, async () => {
    await act(async () => {
      await defaultTestInit(defaultProps);
      const button = screen.getByTestId('map-leave-modal-ok-btn');
      fireEvent.click(button);
      expect(onOk).toBeCalledTimes(1);
    });
  });
});
