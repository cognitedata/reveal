import { render, screen, fireEvent } from '@testing-library/react';
import { CONTINUE_EDITING } from 'UnmountConfirmation/constants';
import ReactModal from 'react-modal';

import {
  UnmountConfirmationModal,
  UnmountConfirmationModalProps,
} from '../UnmountConfirmationModal';

const defaultProps: UnmountConfirmationModalProps = {
  onOk: jest.fn(),
  onCancel: jest.fn(),
  open: true,
};
describe('UnmountConfirmationModal modal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const pageToTest = (props: UnmountConfirmationModalProps) => (
    <UnmountConfirmationModal {...props}>
      <div>TEST CONTENT</div>
    </UnmountConfirmationModal>
  );

  const defaultTestInit = async (props: UnmountConfirmationModalProps) => {
    const { container, rerender } = render(pageToTest(props));
    ReactModal.setAppElement(container);
    return rerender(pageToTest(props));
  };

  it('should display modal', async () => {
    await defaultTestInit(defaultProps);
    const headerText = screen.getByText('TEST CONTENT');
    expect(headerText).toBeInTheDocument();
  });

  it('should close modal', async () => {
    await defaultTestInit({
      ...defaultProps,
      open: false,
    });
    const headerText = screen.queryByText('TEST CONTENT');
    expect(headerText).not.toBeInTheDocument();
  });

  it('should trigger callback on cancel button click', async () => {
    await defaultTestInit(defaultProps);
    const button = screen.getByTestId('map-leave-modal-cancel-btn');
    fireEvent.click(button);
    expect(defaultProps.onCancel).toBeCalledTimes(1);
  });

  it('should trigger callback on ok button click', async () => {
    await defaultTestInit(defaultProps);
    const button = screen.getByText(CONTINUE_EDITING);
    fireEvent.click(button);
    expect(defaultProps.onOk).toBeCalledTimes(1);
  });
});
