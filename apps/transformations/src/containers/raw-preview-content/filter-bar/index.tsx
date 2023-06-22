import { Dispatch, SetStateAction } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import {
  FilterItem,
  FilterType,
} from '@transformations/components/filter-item';
import TabHeader from '@transformations/components/tab/TabHeader';
import { useFilters } from '@transformations/hooks/table-filters';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { getRawTabKey, trackUsage } from '@transformations/utils';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

import { RawTabView } from '../RawPreviewContent';

import { ViewActions } from './ViewActions';

type Props = {
  isEmpty?: boolean;
  areTypesFetched?: boolean;
  hasActions?: boolean;
  isTableDataLoading?: boolean;
  database: string;
  table: string;
  activeView: RawTabView;
  onChangeView: (view: RawTabView) => void;
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};

export const FilterBar = ({
  isEmpty,
  areTypesFetched,
  hasActions,
  isTableDataLoading,
  database,
  table,
  activeView,
  onChangeView,
  isExpanded,
  setIsExpanded,
}: Props): JSX.Element => {
  const { removeTab } = useTransformationContext();

  const { t } = useTranslation();
  const { filters, columnTypeFilters, setTypeFilter } = useFilters(
    database,
    table
  );

  const onFilterClick = (filter: FilterType) => {
    trackUsage({
      e: 'Details.RAW.Table.Filter.Click',
      field: filter.type,
      table,
    });
    setTypeFilter(filter.type);
  };

  const onToggleRawTableViewHandler = (view: RawTabView) => {
    trackUsage({ e: 'Details.RAW.Table.Toggle.View.Click', view, table });
    onChangeView(view);
  };

  const handleCloseTab = () => {
    removeTab(getRawTabKey(database, table));
  };

  if (isEmpty) {
    return <></>;
  }

  return (
    <Flex justifyContent="space-between" gap={8} alignItems="center">
      <TabHeader
        description={database}
        icon="DataTable"
        status="success"
        title={table}
        titleLink={createLink('/raw', {
          activeTable: JSON.stringify([database, table, null]),
          tabs: JSON.stringify([[database, table, null]]),
        })}
      />
      <Flex alignItems="center" gap={8}>
        {!areTypesFetched ? (
          <>
            <Body level={2}>{t('data-profiling-running')}</Body>
            <span className="load-icon">
              <Icon type="Loader" />
            </span>
          </>
        ) : (
          filters.map((filter: FilterType) => {
            const active = columnTypeFilters.includes(filter.type);
            return (
              <FilterItem
                key={`${filter.type}_${filter.value}`}
                filter={filter}
                active={active}
                onClick={onFilterClick}
              />
            );
          })
        )}
        {hasActions && (
          <>
            <StyledDivider />
            <ViewActions
              selectedView={activeView}
              onToggleRawTableView={onToggleRawTableViewHandler}
              isTableDataLoading={isTableDataLoading}
              onClose={handleCloseTab}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
};

const StyledDivider = styled.div`
  background-color: ${Colors['border--muted']};
  height: 16px;
  width: 1px;
`;
