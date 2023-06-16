import { ReactNode } from 'react';

import styled from 'styled-components';

import { Body, Flex } from '@cognite/cogs.js';

type PanelItemProps = {
  left: ReactNode;
  right?: ReactNode;
};

export const PanelItem = ({ left, right, ...props }: PanelItemProps) => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap={10}
      {...props}
    >
      <Left>{left}</Left>
      {right && <Right>{right}</Right>}
    </Flex>
  );
};

const Left = styled(Body).attrs({ level: 2, strong: true })`
  white-space: nowrap;
`;

const Right = styled(Body).attrs({ level: 2 })`
  text-align: right;
`;
