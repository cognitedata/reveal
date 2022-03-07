import React from 'react';
import styled from 'styled-components';
import layers from 'src/utils/zIndex';

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

const ExtraTableBorders = styled.div`
  th:first-child,
  td:first-child {
    border-right: 1px solid var(--cogs-greyscale-grey2);
  }

  table {
    border: 1px solid var(--cogs-greyscale-grey2);
  }
`;

const StickyFirstColumn = styled.div`
  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    background-color: white;
    border-right: 1px solid var(--cogs-greyscale-grey2);
  }
`;

const AlignTableValuesCenter = styled.div`
  th,
  td {
    text-align: center !important;
  }
  .cogs-th-container {
    display: block;
  }
`;

interface Props {
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  alignValuesCenter?: boolean;
  extraBorders?: boolean;
}

export const TableWrapper: React.FC<Props> = ({
  stickyHeader,
  stickyFirstColumn,
  alignValuesCenter,
  extraBorders,
  children,
}) => {
  const StickyHeadWrapper = stickyHeader ? StickyTableHead : React.Fragment;

  const StickyFirstColumnWrapper = stickyFirstColumn
    ? StickyFirstColumn
    : React.Fragment;

  const AlignCenterWrapper = alignValuesCenter
    ? AlignTableValuesCenter
    : React.Fragment;

  const ExtraBordersWrapper = extraBorders ? ExtraTableBorders : React.Fragment;

  return (
    <Container>
      <StickyHeadWrapper>
        <StickyFirstColumnWrapper>
          <ExtraBordersWrapper>
            <AlignCenterWrapper>{children}</AlignCenterWrapper>
          </ExtraBordersWrapper>
        </StickyFirstColumnWrapper>
      </StickyHeadWrapper>
    </Container>
  );
};
