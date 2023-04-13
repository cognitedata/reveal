import { Row } from '@tanstack/react-table';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { Tr } from '../elements';

export const HierarchyExtraRow = <
  T extends {
    shouldShowMoreAssetsRow?: boolean;
  }
>(
  row: Row<T>,
  onAssetSeeMoreClicked: (item: T) => void
) => {
  const { shouldShowMoreAssetsRow } = row.original;

  if (!shouldShowMoreAssetsRow) {
    return null;
  }

  return (
    <Tr
      key={`${row.id}-extra`}
      id={`${row.id}-extra`}
      onClick={() => onAssetSeeMoreClicked(row.original)}
      className="extra-row"
    >
      <SeeMoreWrapper depth={row.depth} canExpand={row.getCanExpand()}>
        <SpanWrapper>
          <StyledSpan>View full hierarchy</StyledSpan>
          <Icon size={12} type="ArrowRight" />
        </SpanWrapper>
      </SeeMoreWrapper>
    </Tr>
  );
};

const SeeMoreWrapper = styled.div<{ depth: number; canExpand: boolean }>`
  display: 'flex';
  padding-left: ${(props) =>
    `calc(${props.depth * 2}rem + 12px + ${props.canExpand ? '24' : '0'}px)`};
`;

const SpanWrapper = styled.div`
  margin-right: auto;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: var(--cogs-text-icon--interactive--default);
`;

const StyledSpan = styled.span`
  margin-right: 6px;
  &:hover {
    color: var(--cogs-text-icon--interactive--hover);
    cursor: pointer;
  }
`;
