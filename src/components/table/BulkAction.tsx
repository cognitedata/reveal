import React from 'react';
import { Flex } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

import layers from 'src/utils/zIndex';

interface BarProps {
  $visible: boolean;
}

export const Wrapper = styled.div<BarProps>`
  display: ${(props: BarProps) => (props.$visible ? 'block' : 'none')};
  margin-bottom: ${(props: BarProps) => (props.$visible ? '1rem' : '0')};
  z-index: ${layers.BULK_ACTION};
`;

export const Bar = styled(Flex).attrs({ direction: 'row' })<BarProps>`
  padding: 0 1rem;
  justify-content: space-between;
  align-items: center;
  height: 3.5rem;
  background: var(--cogs-primary);
  border-radius: 0.5rem;
`;

export const Title = styled(Flex).attrs({ direction: 'row' })`
  color: var(--cogs-white);
  font-size: 16px;
  font-weight: 600;
`;

export const Subtitle = styled(Flex).attrs({ direction: 'row' })`
  color: var(--cogs-white);
  font-size: 12px;
  font-weight: 500;
  opacity: 0.5;
`;

export interface Props {
  isVisible: boolean;
  title: string;
  subtitle?: string;
}

const TableBulkActions: React.FC<Props> = ({
  isVisible,
  title,
  subtitle,
  children,
}) => {
  return (
    <Wrapper $visible={isVisible} data-testid="table-bulk-actions">
      <Bar $visible={isVisible}>
        <Flex direction="column">
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </Flex>
        <Flex alignItems="flex-end">{children}</Flex>
      </Bar>
    </Wrapper>
  );
};

export default TableBulkActions;
