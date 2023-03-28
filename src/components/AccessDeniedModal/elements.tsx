import styled from 'styled-components';
import { Icon, Modal, Flex, Title } from '@cognite/cogs.js';

export const StyledIcon = styled(Icon)`
  color: var(--cogs-text-icon--status-neutral);
`;

export const StyledModal = styled(Modal)`
  && {
    .cogs-modal-header {
      border-bottom: none;
    }
    .cogs-modal-footer {
      border-top: none;
      padding: 0;
    }
  }
`;

export const StyledUl = styled.ul`
  padding-inline-start: 20px;
`;

export const ModalHeader = ({ title }: { title: string }) => {
  return (
    <Flex gap={12} alignItems="center">
      <StyledIcon type="InfoFilled" />
      <Title level={5}>{title}</Title>
    </Flex>
  );
};
