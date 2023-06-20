import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';

import styled from 'styled-components';

import { PREVIEW_TAB_HEIGHT } from '@transformations/common';
import { useTranslation } from '@transformations/common/i18n';
import { useColumnType } from '@transformations/hooks/profiling-service';
import {
  useIsTableEmpty,
  useTableData,
} from '@transformations/hooks/table-data';
import { useCellSelection } from '@transformations/hooks/table-selection';

import { Colors, Elevations, Flex, Icon } from '@cognite/cogs.js';

import { FilterBar } from './filter-bar';
import { RawTable } from './raw-table';
import { RawTabView } from './RawPreviewContent';

type RawPreviewTableProps = {
  className?: string;
  database: string;
  table: string;
  activeView: RawTabView;
  setActiveView: (view: RawTabView) => void;
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};
const RawPreviewTable = ({
  className,
  database,
  table,
  activeView,
  setActiveView,
  isExpanded,
  setIsExpanded,
}: RawPreviewTableProps) => {
  const { t } = useTranslation();

  const {
    rows,
    filteredColumns,
    isInitialLoading,
    isFetched,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useTableData(database, table);

  const { isFetched: areTypesFetched } = useColumnType(database, table);
  const isEmpty = useIsTableEmpty(database, table);

  const { deselectCell } = useCellSelection();

  const onCellClickOutside = useCallback(() => {
    deselectCell();
  }, [deselectCell]);

  useEffect(() => {
    document.addEventListener('click', onCellClickOutside);
    return () => {
      document.removeEventListener('click', onCellClickOutside);
    };
  }, [onCellClickOutside]);

  return (
    <RawPreviewContainer
      $isExpanded={isExpanded}
      className={className}
      direction="column"
    >
      <FilterBar
        database={database}
        table={table}
        key={`${database}_${table}`}
        isEmpty={isEmpty}
        areTypesFetched={areTypesFetched}
        hasActions={true}
        isTableDataLoading={isInitialLoading}
        activeView={activeView}
        onChangeView={setActiveView}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      {isInitialLoading ? (
        <span style={{ margin: 'auto' }}>
          <Icon type="Loader" size={12} />
        </span>
      ) : (
        <>
          <RawTable
            isEmpty={isEmpty}
            rows={rows}
            columns={filteredColumns}
            database={database}
            table={table}
            onEndReach={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
          />
          <Loading $visible={isFetched && isFetching}>
            <span style={{ marginRight: 8 }}>
              <Icon type="Loader" size={12} />
            </span>
            {t('loading-data')}
          </Loading>
        </>
      )}
    </RawPreviewContainer>
  );
};

export const RawPreviewContainer = styled(Flex).attrs({ gap: 10 })<{
  $isExpanded?: boolean;
}>`
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--disabled']};
  border-radius: 6px;
  height: ${({ $isExpanded }) =>
    $isExpanded ? '100%' : `${PREVIEW_TAB_HEIGHT}px`};
  min-height: ${PREVIEW_TAB_HEIGHT}px; /* TODO: make it responsive */
  width: 100%;
  padding: 10px 12px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  :hover {
    box-shadow: ${Elevations['elevation--surface--interactive']};
  }
`;

const Loading = styled.p<{ $visible: boolean }>`
  position: absolute;
  bottom: 24px;
  left: 50%;
  text-align: center;
  background-color: ${Colors['decorative--blue--400']};
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity 0.5s linear 1s;
`;

export default RawPreviewTable;
