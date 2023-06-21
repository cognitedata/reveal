import { ReactNode, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { Checkbox } from 'antd';

import { Body, Colors, Flex, Modal, ModalProps } from '@cognite/cogs.js';

export type DeleteModalProps = {
  bodyText: string;
  checkboxLabel: string;
  extraContent?: ReactNode;
  withCheckbox?: boolean;
  items: { id: number | string; name: string }[];
  visible: boolean;
  okText: string;
  cancelText: string;
  onCancel: () => void;
  onOk: () => void;
  loading?: boolean;
} & Omit<ModalProps, 'children'>;

const DeleteModal = ({
  bodyText,
  checkboxLabel,
  extraContent,
  withCheckbox = true,
  visible,
  okText,
  cancelText,
  onCancel,
  onOk,
  loading = false,
}: DeleteModalProps) => {
  const { t } = useTranslation();
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <Modal
      okDisabled={withCheckbox && !isConfirmed}
      title={t('transformation-delete-modal-title')}
      icon={loading ? 'Loader' : 'WarningFilled'}
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText={okText}
      cancelText={cancelText}
      destructive
    >
      <Flex direction="column" gap={10}>
        <StyledBodyText>{bodyText}</StyledBodyText>
        {extraContent}
        {withCheckbox && (
          <Checkbox
            checked={isConfirmed}
            name="confirmDelete"
            onChange={(e) => setIsConfirmed(e.target.checked)}
          >
            {checkboxLabel}
          </Checkbox>
        )}
      </Flex>
    </Modal>
  );
};

const StyledBodyText = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--strong']};
`;

export default DeleteModal;
