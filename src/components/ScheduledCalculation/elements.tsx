import styled from 'styled-components';

import { Modal, Flex, Icon, Title } from '@cognite/cogs.js';

const StyledDeleteIcon = styled(Icon)`
  color: var(--cogs-text-icon--status-critical);
`;

export const StyledModal = styled(Modal)`
  && {
    .cogs-modal-header {
      border-bottom: none;
    }
    .cogs-modal-footer {
      border-top: none;
      padding: 14px 16px;
    }
  }
`;

export const DeleteModalHeader = ({ title }: { title: string }) => {
  return (
    <Flex gap={12} alignItems="center">
      <StyledDeleteIcon type="Delete" />
      <Title level={5}>{title}</Title>
    </Flex>
  );
};
