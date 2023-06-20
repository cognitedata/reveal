import { Dispatch, SetStateAction } from 'react';

import { useColumnType } from '@transformations/hooks/profiling-service';
import {
  useIsTableEmpty,
  useTableData,
} from '@transformations/hooks/table-data';

import { Icon } from '@cognite/cogs.js';

import { FilterBar } from './filter-bar';
import { Profiling } from './profiling';
import { RawTabView } from './RawPreviewContent';
import { RawPreviewContainer } from './RawPreviewTable';

type RawPreviewProfilingProps = {
  className?: string;
  database: string;
  table: string;
  activeView: RawTabView;
  setActiveView: (view: RawTabView) => void;
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};
const RawPreviewProfiling = ({
  className,
  database,
  table,
  activeView,
  setActiveView,
  isExpanded,
  setIsExpanded,
}: RawPreviewProfilingProps) => {
  const { isInitialLoading } = useTableData(database, table);

  const { isFetched: areTypesFetched } = useColumnType(database, table);
  const isEmpty = useIsTableEmpty(database, table);

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
        <Profiling
          database={database}
          table={table}
          key={`${database}_${table}`}
        />
      )}
    </RawPreviewContainer>
  );
};

export default RawPreviewProfiling;
