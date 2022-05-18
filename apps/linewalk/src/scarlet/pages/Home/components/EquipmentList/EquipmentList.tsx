import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { Table, Graphic } from '@cognite/cogs.js';
import { useHistory, generatePath } from 'react-router-dom';
import { getEquipmentList } from 'scarlet/api';
import { useApi, useHomePageContext } from 'scarlet/hooks';
import { RoutePath } from 'scarlet/routes';

import { ExportBar, ExportTools, TopBar, StatusBar } from '..';
import { EquipmentsFilter } from '../EquipmentsFilter';

import * as Styled from './style';
import {
  ColumnAccessor,
  EquipmentListItem,
  EquipmentStatus,
  EquipmentType,
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
  equipmentType: 'all' | EquipmentType;
  equipmentStatus: 'all' | EquipmentStatus;
};

const defaultFilter: Filter = {
  search: '',
  equipmentType: 'all',
  equipmentStatus: 'all',
};

export const EquipmentList = () => {
  const history = useHistory();
  const TableContainerRef = useRef<HTMLDivElement>(null);
  const [tableKeyToReset, setTableKeyToReset] = useState(uuid());
  const { homePageState, homePageDispatch } = useHomePageContext();

  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const { facility, unitId } = homePageState;

  const equipmentListQuery = useApi<EquipmentListItem[]>(getEquipmentList, {
    facility,
    unitId,
  });

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
          (filter.equipmentType === 'all' ||
            item.type === filter.equipmentType) &&
          (filter.equipmentStatus === 'all' ||
            item.status === filter.equipmentStatus)
      ),
    [data, filter]
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

  const onSelectionChange = useCallback((items: EquipmentListItem[]) => {
    const selectedEquipmentIds = items.map((item) => item.id);

    homePageDispatch({
      type: HomePageActionType.SELECT_EQUIPMENTS,
      selectedEquipmentIds,
    });
  }, []);

  useEffect(() => {
    if (!homePageState.selectedEquipmentIds.length) {
      setTableKeyToReset(uuid());
    }
  }, [homePageState.selectedEquipmentIds]);

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
              loading={loading}
              filter={filter}
              setFilter={setFilter}
              numberEquipments={equipmentList?.length || 0}
              key={unitId}
            />
          )}
          <Styled.TableContainer isLoading={loading} ref={TableContainerRef}>
            {pageSize && (
              <Table<EquipmentListItem | any>
                key={tableKeyToReset}
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
                          generatePath(RoutePath.EQUIPMENT, {
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
                onSelectionChange={onSelectionChange}
                defaultSelectedIds={{}}
              />
            )}
          </Styled.TableContainer>
          {Boolean(homePageState.selectedEquipmentIds.length) && <ExportBar />}
        </Styled.ContentWrapper>
      )}
      <ExportTools />
    </Styled.Container>
  );
};
