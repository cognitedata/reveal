import { ReactNode } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';

import { Body, Colors, Flex, Modal, ModalProps } from '@cognite/cogs.js';

export type UpdateModalProps = {
  scheduleType: 'pause' | 'resume' | undefined;
  bodyText: string;
  extraContent?: ReactNode;
  items: { id: number | string; name: string }[];
  visible: boolean;
  okText: string;
  cancelText: string;
  onCancel: () => void;
  onOk: () => void;
  loading?: boolean;
} & Omit<ModalProps, 'children'>;

const UpdateModal = ({
  scheduleType,
  bodyText,
  extraContent,
  visible,
  okText,
  cancelText,
  onCancel,
  onOk,
  loading = false,
}: UpdateModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t(
        scheduleType === 'resume'
          ? 'transformations-resume-schedule-modal-title'
          : 'transformations-pause-schedule-modal-title'
      )}
      icon={loading ? 'Loader' : 'InfoFilled'}
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText={okText}
      cancelText={cancelText}
    >
      <Flex direction="column" gap={10}>
        <StyledBodyText>{bodyText}</StyledBodyText>
        {extraContent}
      </Flex>
    </Modal>
  );
};

const StyledBodyText = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--strong']};
`;

export default UpdateModal;
