import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { ColumnShape } from 'react-base-table';
import { NameAndAnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameAndAnnotation';
import { Tabs } from '@cognite/data-exploration';
import { useDispatch, useSelector } from 'react-redux';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/fileDetailsSlice';
import { RootState } from 'src/store/rootReducer';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { SelectableTable } from '../SelectableTable/SelectableTable';
import { TableDataItem } from '../../types';
import { NameSorter } from '../../Containers/Sorters/NameSorter';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { FileExplorerTableProps } from '../FileTable/types';

export const MapFileTable = (props: FileExplorerTableProps) => {
  const dispatch = useDispatch();

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

  const rendererMap = {
    name: NameAndAnnotationRenderer,
  };

  const sorters = {
    name: NameSorter,
  };

  const withGeoData = useSelector((state: RootState) =>
    props.data?.filter(
      (item: TableDataItem) =>
        selectUpdatedFileDetails(state, String(item.id))?.geoLocation
    )
  );

  const withOutGeoData = useSelector((state: RootState) =>
    props.data?.filter(
      (item: TableDataItem) =>
        selectUpdatedFileDetails(state, String(item.id))?.geoLocation ===
        undefined
    )
  );

  const rowClassNames = ({
    rowData,
  }: {
    columns: ColumnShape<TableDataItem>[];
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    return `clickable ${props.selectedFileId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onRowClick(rowData);
    },
  };

  const fileIds = useMemo(() => {
    return props.data.map((item: TableDataItem) => item.id);
  }, [props.data]);

  useEffect(() => {
    dispatch(RetrieveAnnotations({ fileIds, assetIds: undefined }));
  }, [fileIds]);

  return (
    <Container>
      <Tabs
        tab="fileInMap"
        onTabChange={() => {}}
        style={{
          fontSize: 14,
          fontWeight: 600,
          lineHeight: '20px',
          paddingBottom: '13px',
          border: 0,
          // eslint-disable-next-line
          zIndex: 0, // HACK: to not cover the ML model dropdown menu
        }}
      >
        <Tabs.Pane
          title="Files in map"
          key="fileInMap"
          style={{ overflow: 'hidden', height: 'calc(100% - 100px)' }}
        >
          <SorterPaginationWrapper
            data={withGeoData}
            totalCount={props.totalCount}
            sorters={sorters}
            pagination
          >
            <SelectableTable
              {...props}
              data={withGeoData}
              columns={columns}
              rendererMap={rendererMap}
              selectable
              onRowSelect={props.onRowSelect}
              rowHeight={70}
              rowClassNames={rowClassNames}
              // rowEventHandlers={rowEventHandlers}
            />
          </SorterPaginationWrapper>
        </Tabs.Pane>

        <Tabs.Pane
          title="Files without location"
          key="filesWithoutMap"
          style={{ overflow: 'hidden', height: 'calc(100% - 100px)' }}
        >
          <SorterPaginationWrapper
            data={withOutGeoData}
            totalCount={props.totalCount}
            sorters={sorters}
            pagination
          >
            <SelectableTable
              data={withOutGeoData}
              {...props}
              columns={columns}
              rendererMap={rendererMap}
              selectable
              onRowSelect={props.onRowSelect}
              rowHeight={70}
              rowClassNames={rowClassNames}
              // rowEventHandlers={rowEventHandlers}
            />
          </SorterPaginationWrapper>
        </Tabs.Pane>
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
