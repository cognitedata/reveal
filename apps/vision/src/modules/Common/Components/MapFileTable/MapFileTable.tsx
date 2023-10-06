import React, { useMemo, useState } from 'react';
import { ColumnShape } from 'react-base-table';

import styled from 'styled-components';

import { Tabs } from '@cognite/cogs.js';

import { NameAndAnnotationRenderer } from '../../Containers/FileTableRenderers/NameAndAnnotation';
import { ResultData, TableDataItem } from '../../types';
import { FileMapTableProps, PageSize } from '../FileTable/types';
import { LoadingTable } from '../LoadingRenderer/LoadingTable';
import { NoData } from '../NoData/NoData';
import { SelectableTable } from '../SelectableTable/SelectableTable';
import { PaginationWrapper } from '../SorterPaginationWrapper/PaginationWrapper';

type MapTableProps = FileMapTableProps<TableDataItem> & {
  setMapActive: (active: boolean) => void;
  mapCallback: (fileId: number) => void;
};

const rendererMap = {
  name: NameAndAnnotationRenderer,
};

export const MapFileTable = (props: MapTableProps) => {
  const columns: ColumnShape<TableDataItem>[] = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
      sortable: true,
    },
  ];

  const [currentPageFilesWithLocation, setCurrentPageFilesWithLocation] =
    useState(1);
  const [currentPageFilesWithNoLocation, setCurrentPageFilesWithNoLocation] =
    useState(1);

  const withGeoData = useMemo(() => {
    return props.data.filter(
      (item: ResultData) => item.geoLocation !== undefined
    );
  }, [props.data]);

  const findSelectedItems = (items: ResultData[]): [boolean, number[]] => {
    const ids = items.map((file) => file.id);
    const allSelected = ids.every((id) => props.selectedIds.includes(id));
    const selectedIds = allSelected
      ? ids
      : ids.filter((id) => props.selectedIds.includes(id));
    return [allSelected, selectedIds];
  };

  const [allWithGeoDataSelected, selectedIdsWithGeoData] = useMemo(() => {
    return findSelectedItems(withGeoData);
  }, [props.selectedIds, withGeoData]);

  const withOutGeoData = useMemo(() => {
    return props.data.filter(
      (item: ResultData) => item.geoLocation === undefined
    );
  }, [props.data]);

  const [allWithoutGeoDataSelected, selectedIdsWithoutGeoData] = useMemo(() => {
    return findSelectedItems(withOutGeoData);
  }, [props.selectedIds, withOutGeoData]);

  const rowClassNames = ({
    rowData,
  }: {
    columns: ColumnShape<TableDataItem>[];
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    return `clickable ${props.focusedId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onItemClick(rowData as ResultData);
      props.mapCallback(rowData.id);
    },
    onContextMenu: ({
      event,
      rowData,
    }: {
      event: React.SyntheticEvent;
      rowData: TableDataItem;
    }) => {
      if (props.onItemRightClick) {
        props.onItemRightClick(event as unknown as MouseEvent, rowData);
      }
    },
  };

  const handleSetSortKey = (key: string) => {
    setCurrentPageFilesWithLocation(1);
    setCurrentPageFilesWithNoLocation(1);
    if (props.setSortKey) {
      props.setSortKey(key);
    }
  };

  const handleSetReverse = (reverse: boolean) => {
    setCurrentPageFilesWithLocation(1);
    setCurrentPageFilesWithNoLocation(1);
    if (props.setReverse) {
      props.setReverse(reverse);
    }
  };

  const handleSetPageSize = (pageSize: PageSize) => {
    setCurrentPageFilesWithLocation(1);
    setCurrentPageFilesWithNoLocation(1);
    if (props.setPageSize) {
      props.setPageSize(pageSize);
    }
  };

  const sortPaginateControls = {
    sortKey: props.sortKey,
    reverse: props.reverse,
    pageSize: props.pageSize,
    setSortKey: handleSetSortKey,
    setReverse: handleSetReverse,
    setPageSize: handleSetPageSize,
  };

  const overlayRenderer = () =>
    props.isLoading ? <LoadingTable columns={columns} /> : <></>;
  const emptyRenderer = () => (props.isLoading ? <></> : <NoData />);

  return (
    <Container>
      <Tabs>
        <Tabs.Tab tabKey="fileInMap" label="Files in map">
          <TabContentWrapper>
            <PaginationWrapper
              data={withGeoData}
              totalCount={props.totalCount}
              pagination
              sortPaginateControls={{
                ...sortPaginateControls,
                currentPage: currentPageFilesWithLocation,
                setCurrentPage: setCurrentPageFilesWithLocation,
              }}
              isLoading={props.isLoading}
            >
              {(paginationProps) => (
                <SelectableTable
                  {...props}
                  {...paginationProps}
                  onSelectAllRows={(status) =>
                    props.onSelectAllRows(status, { geoLocation: true })
                  }
                  onItemSelect={props.onItemSelect}
                  allRowsSelected={allWithGeoDataSelected}
                  selectedIds={selectedIdsWithGeoData}
                  columns={columns}
                  rendererMap={rendererMap}
                  selectable
                  rowHeight={70}
                  rowClassNames={rowClassNames}
                  rowEventHandlers={rowEventHandlers}
                  overlayRenderer={overlayRenderer}
                  emptyRenderer={emptyRenderer}
                />
              )}
            </PaginationWrapper>
          </TabContentWrapper>
        </Tabs.Tab>
        <Tabs.Tab tabKey="filesWithoutMap" label="Files without location">
          <TabContentWrapper>
            <PaginationWrapper
              data={withOutGeoData}
              totalCount={props.totalCount}
              pagination
              sortPaginateControls={{
                ...sortPaginateControls,
                currentPage: currentPageFilesWithNoLocation,
                setCurrentPage: setCurrentPageFilesWithNoLocation,
              }}
              isLoading={props.isLoading}
            >
              {(paginationProps) => (
                <SelectableTable
                  {...props}
                  {...paginationProps}
                  onSelectAllRows={(status) =>
                    props.onSelectAllRows(status, { geoLocation: false })
                  }
                  onItemSelect={props.onItemSelect}
                  allRowsSelected={allWithoutGeoDataSelected}
                  selectedIds={selectedIdsWithoutGeoData}
                  columns={columns}
                  rendererMap={rendererMap}
                  selectable
                  rowHeight={70}
                  rowClassNames={rowClassNames}
                  rowEventHandlers={rowEventHandlers}
                  emptyRenderer={emptyRenderer}
                  overlayRenderer={overlayRenderer}
                />
              )}
            </PaginationWrapper>
          </TabContentWrapper>
        </Tabs.Tab>
      </Tabs>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  width: 100%;
  height: 100%;
`;
const TabContentWrapper = styled.div`
  height: calc(100vh - 301px);
`;
