import { fireEvent, screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { UNASSIGN, UNASSIGN_WARNING } from '../../constants';
import { UnassignWarningModal } from '../UnassignWarningModal';

describe('UnassignWarningModal', () => {
  const unassign = jest.fn();
  const unassignModal = jest.fn();

  afterEach(() => jest.clearAllMocks());

  const initiateTest = (props: any) => {
    return testRendererModal(UnassignWarningModal, undefined, props);
  };

  it('should not render the component when `openModal` is false', async () => {
    await initiateTest({
      openModal: false,
    });

    expect(screen.queryByText(UNASSIGN_WARNING)).not.toBeInTheDocument();
  });

  it('should render the component when `openModal` is true', async () => {
    await initiateTest({
      openModal: true,
    });

    expect(screen.getByText(UNASSIGN_WARNING)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText(UNASSIGN)).toBeInTheDocument();
  });

  it('should call the `unassignModal` when click `Cancel` button', async () => {
    await initiateTest({
      openModal: true,
      unassign,
      unassignModal,
    });

    fireEvent.click(screen.getByText('Cancel'));
    expect(unassignModal).toHaveBeenCalledTimes(1);
    expect(unassign).toHaveBeenCalledTimes(0);
  });

  it('should call `unassign` when click Unassign button', async () => {
    await initiateTest({
      openModal: true,
      unassign,
      unassignModal,
    });
    fireEvent.click(screen.getByText(UNASSIGN));
    expect(unassignModal).toHaveBeenCalledTimes(0);
    expect(unassign).toHaveBeenCalledTimes(1);
  });
});
