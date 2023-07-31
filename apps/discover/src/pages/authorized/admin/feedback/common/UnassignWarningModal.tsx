import { WarningModal } from 'components/Modal/WarningModal';

import { UNASSIGN, UNASSIGN_WARNING } from '../constants';

import { UnassignWarningMessage } from './elements';

type Props = {
  openModal: boolean;
  unassignModal: () => void;
  unassign: () => void;
};

export const UnassignWarningModal = ({
  openModal,
  unassign,
  unassignModal,
}: Props) => {
  return (
    <WarningModal
      closeIcon={null}
      visible={openModal}
      onOk={unassign}
      onCancel={unassignModal}
      width={264}
      okText={UNASSIGN}
    >
      <UnassignWarningMessage>{UNASSIGN_WARNING}</UnassignWarningMessage>
    </WarningModal>
  );
};
