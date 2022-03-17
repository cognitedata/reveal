import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Table, Input, Graphic } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';
import { useHistory, useParams, generatePath } from 'react-router-dom';
import { getEquipmentList, getUnitState } from 'scarlet/api';
import { useApi } from 'scarlet/hooks';
import { RoutePath } from 'scarlet/routes';

import { BreadcrumbBar } from './components';
import * as Styled from './style';
import { ColumnAccessor, EquipmentListItem, UnitData } from './types';
import { getCellSkeleton, getCellStatus, getCellValue } from './utils';

export const EquipmentList = () => {
  const { unitName } = useParams<{ unitName: string }>();
  const history = useHistory();
  const TableContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: listData,
    loading: listLoading,
    error: listError,
  } = useApi<EquipmentListItem[]>(getEquipmentList, { unitName });

  const {
    data: unitState,
    loading: unitStateLoading,
    error: unitStateError,
  } = useApi<UnitData>(getUnitState, { unitName });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ search: '' });

  const setFilterWithDebounce = useCallback(debounce(setFilter, 300), []);
  useEffect(
    () => setFilterWithDebounce({ search: search.trim().toLocaleLowerCase() }),
    [search]
  );

  const loading = listLoading || unitStateLoading;
  const error = listError || unitStateError;
  const data = useMemo(() => {
    if (loading) return undefined;
    return listData?.map((item) => ({
      ...item,
      status: unitState?.equipments[item.id]?.isApproved
        ? 'Approved'
        : 'Pending review',
    }));
  }, [listData, unitState]);

  const equipmentList = useMemo(() => {
    if (!search) return data;
    return data?.filter(
      (item) =>
        item.id.toLocaleLowerCase().includes(filter.search) ||
        item.type?.toLocaleLowerCase().includes(filter.search) ||
        item.status?.toLocaleLowerCase().includes(filter.search)
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
      <BreadcrumbBar unitName={unitName} />

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
                    Cell: loading ? getCellSkeleton : getCellValue,
                  },
                  {
                    Header: 'Status',
                    accessor: ColumnAccessor.STATUS,
                    Cell: loading ? getCellSkeleton : getCellStatus,
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
