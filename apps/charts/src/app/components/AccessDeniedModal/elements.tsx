import styled from 'styled-components';

import { Icon, Flex, Heading } from '@cognite/cogs.js';

export const StyledIcon = styled(Icon)`
  color: var(--cogs-text-icon--status-neutral);
`;

export const StyledUl = styled.ul`
  padding-inline-start: 20px;
`;

export const ModalHeader = ({ title }: { title: string }) => {
  return (
    <Flex gap={12} alignItems="center">
      <StyledIcon type="InfoFilled" />
      <Heading level={5}>{title}</Heading>
    </Flex>
  );
};
