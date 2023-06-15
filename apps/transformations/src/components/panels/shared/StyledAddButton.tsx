import styled from 'styled-components';

import { Button, Flex, Icon } from '@cognite/cogs.js';

export const StyledAddButton = styled(({ children, ...props }) => {
  return (
    <Button type="ghost" {...props}>
      <Flex gap={3} alignItems="center">
        <Icon type="Plus" size={24} />
        <span>{children}</span>
      </Flex>
    </Button>
  );
})`
  width: 100%;
`;
