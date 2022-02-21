import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Table, Loader, Input, Graphic } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';
import { useHistory, useParams, generatePath } from 'react-router-dom';
import { getEquipmentList } from 'scarlet/api';
import { useApi, useAppContext } from 'scarlet/hooks';
import { RoutePath } from 'scarlet/routes';

import { BreadcrumbBar } from './components';
import * as Styled from './style';
import { ColumnAccessor, EquipmentListItem, AppActionType } from './types';
import { getCellValue } from './utils';

export const EquipmentList = () => {
  const { unitName } = useParams<{ unitName: string }>();
  const history = useHistory();
  const { appState, appDispatch } = useAppContext();
  const TableContainerRef = useRef<HTMLDivElement>(null);

  const isDataAvailableInApp = appState.equipmentList?.unitName === unitName;

  const { data, loading, error } = useApi<EquipmentListItem[]>(
    getEquipmentList,
    { unitName },
    {
      data: isDataAvailableInApp
        ? appState?.equipmentList?.equipments || undefined
        : undefined,
    }
  );

  useEffect(() => {
    if (data && !isDataAvailableInApp) {
      appDispatch({
        type: AppActionType.SET_EQUIPMENT_LIST,
        unitName,
        equipments: data,
      });
    }
  }, [data]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ search: '' });

  const setFilterWithDebounce = useCallback(debounce(setFilter, 300), []);
  useEffect(() => setFilterWithDebounce({ search: search.trim() }), [search]);

  const equipmentList = useMemo(() => {
    if (!search) return data;
    return data?.filter((item) => item.id.includes(filter.search));
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
          {loading ? (
            <Styled.LoaderContainer>
              <Loader infoTitle="Loading equipments" darkMode={false} />
            </Styled.LoaderContainer>
          ) : (
            <>
              {!!data?.length && (
                <Styled.Filters>
                  <Input
                    placeholder="Search by id"
                    iconPlacement="left"
                    value={search}
                    icon="Search"
                    onChange={({ target: { value } }) => {
                      setSearch(value);
                    }}
                    clearable={{
                      labelText: 'Clear search',
                      callback: () => {
                        setSearch('');
                      },
                    }}
                  />
                </Styled.Filters>
              )}
              <Styled.TableContainer ref={TableContainerRef}>
                {pageSize && (
                  <Table<EquipmentListItem>
                    dataSource={equipmentList || []}
                    pageSize={pageSize}
                    columns={[
                      {
                        Header: 'Equipment ID',
                        accessor: ColumnAccessor.ID,
                        maxWidth: 150,
                        Cell: getCellValue,
                      },
                      {
                        Header: 'Equipment type',
                        accessor: ColumnAccessor.TYPE,
                        Cell: getCellValue,
                      },
                    ]}
                    onRowClick={({ original: { id } }) => {
                      history.push(
                        generatePath(RoutePath.EQUIPMENT, {
                          unitName,
                          equipmentName: id,
                        })
                      );
                    }}
                    rowKey={({ id }) => id}
                    flexLayout={{
                      minWidth: 100,
                      width: 300,
                      maxWidth: 500,
                    }}
                  />
                )}
              </Styled.TableContainer>
            </>
          )}
        </Styled.ContentWrapper>
      )}
    </Styled.Container>
  );
};
