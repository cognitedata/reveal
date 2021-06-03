import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ColumnShape } from 'react-base-table';
import { NameAndAnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameAndAnnotation';
import { Tabs } from '@cognite/data-exploration';
import { AnnotationLoader } from 'src/modules/Common/Components/AnnotationLoader/AnnotationLoader';
import { SelectableTable } from '../SelectableTable/SelectableTable';
import { ResultData, TableDataItem } from '../../types';
import { NameSorter } from '../../Containers/Sorters/NameSorter';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { FileExplorerTableProps } from '../FileTable/types';

type MapTableProps = FileExplorerTableProps & {
  setMapActive: (active: boolean) => void;
  mapCallback: (fileId: number) => void;
  setSelectedFileOnMap: (data: ResultData | undefined) => void;
};

const rendererMap = {
  name: NameAndAnnotationRenderer,
};

const sorters = {
  name: NameSorter,
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

  const withGeoData = useMemo(() => {
    return props.data.filter(
      (item: ResultData) => item.geoLocation !== undefined
    );
  }, [props.data]);

  const withOutGeoData = useMemo(() => {
    return props.data.filter(
      (item: ResultData) => item.geoLocation === undefined
    );
  }, [props.data]);

  const rowClassNames = ({
    rowData,
  }: {
    columns: ColumnShape<TableDataItem>[];
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    return `clickable ${props.selectedFileId === rowData.id && 'active'}`;
  };

  const rowEventHandlersWithGeoData = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onRowClick(rowData as ResultData);
      props.mapCallback(rowData.id);
    },
  };

  const rowEventHandlersWithoutGeoData = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onRowClick(rowData as ResultData);
      props.setSelectedFileOnMap(undefined); // hide map popup when selecting from files without geo-info
    },
  };

  return (
    <Container>
      <Tabs
        onTabChange={(key) => {
          if (key === 'fileInMap') {
            props.setMapActive(true);
          } else {
            props.setMapActive(false);
          }
        }}
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
            {(paginationProps) => (
              <AnnotationLoader data={paginationProps.data}>
                <SelectableTable
                  {...props}
                  {...paginationProps}
                  data={withGeoData}
                  columns={columns}
                  rendererMap={rendererMap}
                  selectable
                  onRowSelect={props.onRowSelect}
                  rowHeight={70}
                  rowClassNames={rowClassNames}
                  rowEventHandlers={rowEventHandlersWithGeoData}
                />
              </AnnotationLoader>
            )}
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
            {(paginationProps) => (
              <AnnotationLoader data={paginationProps.data}>
                <SelectableTable
                  {...props}
                  {...paginationProps}
                  columns={columns}
                  rendererMap={rendererMap}
                  selectable
                  onRowSelect={props.onRowSelect}
                  rowHeight={70}
                  rowClassNames={rowClassNames}
                  rowEventHandlers={rowEventHandlersWithoutGeoData}
                />
              </AnnotationLoader>
            )}
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
