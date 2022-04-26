import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Table, Input, Graphic } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';
import { useHistory, useParams, generatePath } from 'react-router-dom';
import { getEquipmentList } from 'scarlet/api';
import { useApi } from 'scarlet/hooks';
import { RoutePath } from 'scarlet/routes';

import { TopBar } from './components';
import * as Styled from './style';
import { ColumnAccessor, EquipmentListItem } from './types';
import {
  getCellSkeleton,
  getCellStatus,
  getCellValue,
  transformSearchValue,
} from './utils';

export const EquipmentList = () => {
  const { unitName } = useParams<{ unitName: string }>();
  const history = useHistory();
  const TableContainerRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useApi<EquipmentListItem[]>(
    getEquipmentList,
    { unitName }
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ search: '' });

  const setFilterWithDebounce = useCallback(debounce(setFilter, 300), []);

  useEffect(
    () =>
      setFilterWithDebounce({
        search: transformSearchValue(search)!,
      }),
    [search]
  );

  const equipmentList = useMemo(() => {
    if (!search) return data;
    return data?.filter(
      (item) =>
        transformSearchValue(item.id)?.includes(filter.search) ||
        transformSearchValue(item.type)?.includes(filter.search) ||
        transformSearchValue(item.status)?.includes(filter.search) ||
        transformSearchValue(item.modifiedBy)?.includes(filter.search)
    );
  }, [data, filter]);

  const pageSize = useMemo(() => {
    const tableContainer = TableContainerRef.current;
    if (tableContainer) {
      const height = tableContainer.offsetHeight;
      const pagination = 60;
      const rowHeight = 54;
      let pageSize = Math.floor((height - pagination - rowHeight) / rowHeight);
      if (pageSize < 5) {
        pageSize = 5;
      }
      return pageSize;
    }
    return undefined;
  }, [TableContainerRef.current]);

  const skeletonList = useMemo(() => {
    return Array.from(Array(100).keys()).map((key) => ({
      id: key.toString(),
    }));
  }, []);

  return (
    <Styled.Container>
      <TopBar unitName={unitName} />

      {error ? (
        <Styled.ContentWrapper empty>
          <div className="cogs-table no-data">
            <Graphic type="Search" />
            Failed to load equipments
          </div>
        </Styled.ContentWrapper>
      ) : (
        <Styled.ContentWrapper empty={!loading && !data?.length}>
          {(!!data?.length || loading) && (
            <Styled.Filters>
              <Input
                placeholder="Search by id"
                iconPlacement="left"
                value={search}
                icon="Search"
                onChange={({ target: { value } }) => {
                  setSearch(value);
                }}
                disabled={loading}
                clearable={{
                  callback: () => {
                    setSearch('');
                  },
                }}
              />
            </Styled.Filters>
          )}
          <Styled.TableContainer isLoading={loading} ref={TableContainerRef}>
            {pageSize && (
              <Table<EquipmentListItem>
                dataSource={loading ? skeletonList : equipmentList || []}
                pageSize={pageSize}
                columns={[
                  {
                    Header: 'Equipment ID',
                    accessor: ColumnAccessor.ID,
                    maxWidth: 150,
                    Cell: loading ? getCellSkeleton : getCellValue,
                  },
                  {
                    Header: 'Equipment type',
                    accessor: ColumnAccessor.TYPE,
                    maxWidth: 250,
                    Cell: loading ? getCellSkeleton : getCellValue,
                  },
                  {
                    Header: 'Status',
                    accessor: ColumnAccessor.STATUS,
                    maxWidth: 250,
                    Cell: loading ? getCellSkeleton : getCellStatus,
                  },
                  {
                    Header: 'Last modified by',
                    accessor: ColumnAccessor.MODIFIED_BY,
                    Cell: loading ? getCellSkeleton : getCellValue,
                  },
                ]}
                onRowClick={
                  loading
                    ? undefined
                    : ({ original: { id } }) => {
                        history.push(
                          generatePath(RoutePath.EQUIPMENT, {
                            unitName,
                            equipmentName: id,
                          })
                        );
                      }
                }
                rowKey={({ id }) => id}
                flexLayout={{
                  minWidth: 100,
                  width: 300,
                  maxWidth: 500,
                }}
              />
            )}
          </Styled.TableContainer>
        </Styled.ContentWrapper>
      )}
    </Styled.Container>
  );
};
