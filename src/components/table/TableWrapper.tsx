import React from 'react';
import styled from 'styled-components';
import layers from 'utils/zIndex';

const Container = styled.div`
  height: 100%;
  width: 100%;

  .cogs-table tr:nth-child(2n) {
    background: white;

    &:hover {
      background: var(--cogs-greyscale-grey2);
    }
  }

  .cogs-table th {
    background: white;
  }
`;

const StickyTableHead = styled.div`
  height: 100%;
  width: 100%;

  thead {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: ${layers.STICKY_TABLE_HEADER};
    box-shadow: inset 0 1px 0 var(--cogs-greyscale-grey2),
      inset 0 -1px 0 var(--cogs-greyscale-grey2);
  }
`;

const StickyFirstColumn = styled.div`
  tbody tr td:first-child {
    position: sticky;
    left: 0;
    background-color: white;
  }
`;

const AlignTableValuesCenter = styled.div`
  td {
    text-align: center !important;
    width: 50px !important;
  }
`;

interface Props {
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  alignValuesCenter?: boolean;
}

export const TableWrapper: React.FC<Props> = ({
  stickyHeader,
  stickyFirstColumn,
  alignValuesCenter,
  children,
}) => {
  const StickyHeadWrapper = stickyHeader ? StickyTableHead : React.Fragment;

  const StickyFirstColumnWrapper = stickyFirstColumn
    ? StickyFirstColumn
    : React.Fragment;

  const AlignCenterWrapper = alignValuesCenter
    ? AlignTableValuesCenter
    : React.Fragment;

  return (
    <Container>
      <StickyHeadWrapper>
        <StickyFirstColumnWrapper>
          <AlignCenterWrapper>{children}</AlignCenterWrapper>
        </StickyFirstColumnWrapper>
      </StickyHeadWrapper>
    </Container>
  );
};
