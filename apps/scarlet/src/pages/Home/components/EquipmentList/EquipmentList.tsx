import { useState, useMemo, useEffect, useRef } from 'react';
import { Table, Graphic } from '@cognite/cogs.js';
import { useHistory, generatePath } from 'react-router-dom';
import { getEquipmentList } from 'api';
import { useApi, useHomePageContext } from 'hooks';
import { PAGES } from 'pages/Menubar';

import { TopBar, StatusBar } from '..';
import { EquipmentsFilter } from '../EquipmentsFilter';

import * as Styled from './style';
import {
  ColumnAccessor,
  EquipmentListItem,
  EquipmentStatus,
  HomePageActionType,
} from './types';
import {
  getCellSkeleton,
  getCellStatus,
  getCellType,
  getCellValue,
  transformSearchValue,
} from './utils';

export type Filter = {
  search: string;
  equipmentTypeName: string;
  equipmentStatus: 'all' | EquipmentStatus;
  U1Presence: string;
};

const defaultFilter: Filter = {
  search: '',
  equipmentTypeName: 'all',
  equipmentStatus: 'all',
  U1Presence: 'all',
};

export const EquipmentList = () => {
  const history = useHistory();
  const TableContainerRef = useRef<HTMLDivElement>(null);
  const { homePageState, homePageDispatch } = useHomePageContext();

  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const { facility, unitId } = homePageState;

  const { state: equipmentListQuery } = useApi<EquipmentListItem[]>(
    getEquipmentList,
    {
      facility,
      unitId,
    }
  );

  useEffect(() => {
    homePageDispatch({
      type: HomePageActionType.SET_EQUIPMENT_LIST,
      equipmentListQuery,
    });
  }, [equipmentListQuery]);

  useEffect(() => {
    setFilter(defaultFilter);
  }, [unitId]);

  const { data } = homePageState.equipmentListQuery;
  const loading =
    homePageState.unitListQuery.loading ||
    homePageState.equipmentListQuery.loading;

  const error =
    homePageState.unitListQuery.error || homePageState.equipmentListQuery.error;

  const equipmentList = useMemo(
    () =>
      data?.filter(
        (item) =>
          transformSearchValue(item.id)?.includes(filter.search) &&
          (filter.equipmentTypeName === 'all' ||
            item.typeName === filter.equipmentTypeName) &&
          (filter.equipmentStatus === 'all' ||
            item.status === filter.equipmentStatus) &&
          (filter.U1Presence === 'all' || item.u1doc === filter.U1Presence)
      ),
    [data, filter]
  );

  const equipmentTypeNames: string[] = useMemo(
    () => [...new Set(data?.map((item) => item.typeName))],
    [data]
  );

  const pageSize = useMemo(() => {
    const tableContainer = TableContainerRef.current;
    if (tableContainer) {
      const height = tableContainer.offsetHeight;
      const pagination = 60;
      const rowHeight = 50;
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

  if (!facility) return null;

  return (
    <Styled.Container>
      <TopBar />
      <StatusBar
        loading={loading}
        equipmentList={homePageState.equipmentListQuery.data}
        key={unitId}
      />
      {!loading && error ? (
        <Styled.ContentWrapper empty>
          <div className="cogs-table no-data">
            <Graphic type="Search" />
            Failed to load equipments
          </div>
        </Styled.ContentWrapper>
      ) : (
        <Styled.ContentWrapper empty={!loading && !data?.length}>
          {(!!data?.length || loading) && (
            <EquipmentsFilter
              key={unitId}
              loading={loading}
              filter={filter}
              numberEquipments={equipmentList?.length || 0}
              equipmentTypeNames={equipmentTypeNames}
              setFilter={setFilter}
            />
          )}
          <Styled.TableContainer isLoading={loading} ref={TableContainerRef}>
            {pageSize && (
              <Table<EquipmentListItem | any>
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
                    maxWidth: 150,
                    Cell: loading ? getCellSkeleton : getCellType,
                  },
                  {
                    Header: 'Status',
                    accessor: ColumnAccessor.STATUS,
                    maxWidth: 150,
                    Cell: loading ? getCellSkeleton : getCellStatus,
                  },
                  {
                    Header: 'U1 Document',
                    accessor: ColumnAccessor.U1_DOC,
                    maxWidth: 100,
                    Cell: loading ? getCellSkeleton : getCellValue,
                  },
                  {
                    Header: 'Last modified by',
                    accessor: ColumnAccessor.MODIFIED_BY,
                    maxWidth: 200,
                    Cell: loading ? getCellSkeleton : getCellValue,
                  },
                ]}
                onRowClick={
                  loading
                    ? undefined
                    : ({ original: { id } }) => {
                        history.push(
                          generatePath(PAGES.EQUIPMENT, {
                            facility: facility!.path,
                            unitId: unitId!,
                            equipmentId: id,
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
