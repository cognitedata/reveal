import { TableV2 as Table, TableProps } from 'components/ReactTable/V2';
import React from 'react';

import styled from 'styled-components';
import { Button, Flex, Icon, IconType, Title } from '@cognite/cogs.js';
import noop from 'lodash/noop';

interface SummaryCardProps<T> extends TableProps<T> {
  iconType?: IconType;
  title: string;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}
export function SummaryCard<T>({
  iconType,
  columns,
  data,
  title,
  onAllResultsClick = noop,
  ...rest
}: SummaryCardProps<T>) {
  return (
    <SequenceWrapper>
      <StyledFlex justifyContent="space-between">
        <Flex gap={8}>
          {iconType && (
            <IconWrapper>
              <Icon type={iconType} />
            </IconWrapper>
          )}
          <Title level={5}>{title}</Title>
        </Flex>
        <Button
          icon="ArrowRight"
          iconPlacement="right"
          onClick={onAllResultsClick}
        >
          {' '}
          All Results
        </Button>
      </StyledFlex>
      <Table columns={columns} data={data.slice(0, 5)} {...rest} />
    </SequenceWrapper>
  );
}

const SequenceWrapper = styled.div`
  border-radius: 8px;
  width: 540px;
  height: 384px;
  border: 1px solid var(--cogs-border--muted);
  padding: 18px 16px;
  background-color: var(--cogs-surface--medium);
`;

const StyledFlex = styled(Flex)`
  border-bottom: 1px solid var(--cogs-border--muted);
  align-items: center;
  padding-bottom: 18px;
`;
const IconWrapper = styled.div`
  padding: 12px;
  display: flex;
  background-color: var(--cogs-surface--status-success--muted--default);
  color: var(--cogs-text-icon--status-success);
  border-radius: 6px;
`;
