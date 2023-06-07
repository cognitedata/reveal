import { useEffect, useState } from 'react';

import Markdown from '@charts-app/components/Markdown/Markdown';
import styled from 'styled-components/macro';

import { OperationVersion } from '@cognite/calculation-backend';
import { Modal } from '@cognite/cogs.js';

type Props = {
  indslFunction: OperationVersion;
  isOpen?: boolean;
  onClose?: () => void;
};

const InfoModal = ({
  indslFunction,
  isOpen = false,
  onClose = () => {},
}: Props) => {
  const [isModalVisible, setIsModalVisible] = useState(isOpen);

  // Control Uncontrolled/Controlled State
  useEffect(() => {
    setIsModalVisible(isOpen);
  }, [isOpen]);

  return (
    <ModalWrapper
      title={indslFunction.name}
      visible={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        onClose();
      }}
      width={750}
    >
      <Markdown>{indslFunction.description || ''}</Markdown>
    </ModalWrapper>
  );
};

export default InfoModal;

const ModalWrapper = styled(Modal)`
  .cogs-modal-header {
    border-bottom: none;
    font-size: var(--cogs-t3-font-size);
  }
`;
