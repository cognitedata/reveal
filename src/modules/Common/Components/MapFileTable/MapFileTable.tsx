import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ColumnShape } from 'react-base-table';
import { NameAndAnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameAndAnnotation';
import { AnnotationLoader } from 'src/modules/Common/Components/AnnotationLoader/AnnotationLoader';
import { Tabs } from 'antd';
import { SelectableTable } from '../SelectableTable/SelectableTable';
import { ResultData, TableDataItem } from '../../types';
import { NameSorter } from '../../Containers/Sorters/NameSorter';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { FileMapTableProps, MapTableTabKey } from '../FileTable/types';

const { TabPane } = Tabs;

type MapTableProps = FileMapTableProps & {
  mapTableTabKey: MapTableTabKey;
  setMapActive: (active: boolean) => void;
  mapCallback: (fileId: number) => void;
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

  const { activeKey, setActiveKey } = props.mapTableTabKey;

  const withGeoData = useMemo(() => {
    return props.data.filter(
      (item: ResultData) => item.geoLocation !== undefined
    );
  }, [props.data]);

  const findSelectedItems = (items: ResultData[]): [boolean, number[]] => {
    const ids = items.map((file) => file.id);
    const allSelected = ids.every((id) => props.selectedRowIds.includes(id));
    const selectedIds = allSelected
      ? ids
      : ids.filter((id) => props.selectedRowIds.includes(id));
    return [allSelected, selectedIds];
  };

  const [allWithGeoDataSelected, selectedIdsWithGeoData] = useMemo(() => {
    return findSelectedItems(withGeoData);
  }, [props.selectedRowIds, withGeoData]);

  const withOutGeoData = useMemo(() => {
    return props.data.filter(
      (item: ResultData) => item.geoLocation === undefined
    );
  }, [props.data]);

  const [allWithoutGeoDataSelected, selectedIdsWithoutGeoData] = useMemo(() => {
    return findSelectedItems(withOutGeoData);
  }, [props.selectedRowIds, withOutGeoData]);

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
      props.onRowClick(rowData as ResultData);
      props.mapCallback(rowData.id);
    },
  };

  return (
    <Container>
      <StyledTabs
        defaultActiveKey={activeKey}
        onChange={(key) => {
          setActiveKey(key);
          if (key === 'fileInMap') {
            props.setMapActive(true);
          } else {
            props.setMapActive(false);
          }
        }}
      >
        <TabPane tab="Files in map" key="fileInMap">
          <SorterPaginationWrapper
            data={withGeoData}
            totalCount={props.totalCount}
            sorters={sorters}
            pagination
            sortPaginateControls={props.sortPaginateControlsLocation}
          >
            {(paginationProps) => (
              <AnnotationLoader data={paginationProps.data}>
                <SelectableTable
                  {...props}
                  {...paginationProps}
                  onSelectAllRows={(status) =>
                    props.onSelectAllRows(status, { geoLocation: true })
                  }
                  allRowsSelected={allWithGeoDataSelected}
                  selectedRowIds={selectedIdsWithGeoData}
                  data={withGeoData}
                  columns={columns}
                  rendererMap={rendererMap}
                  selectable
                  onRowSelect={props.onRowSelect}
                  rowHeight={70}
                  rowClassNames={rowClassNames}
                  rowEventHandlers={rowEventHandlers}
                />
              </AnnotationLoader>
            )}
          </SorterPaginationWrapper>
        </TabPane>

        <TabPane tab="Files without location" key="filesWithoutMap">
          <SorterPaginationWrapper
            data={withOutGeoData}
            totalCount={props.totalCount}
            sorters={sorters}
            pagination
            sortPaginateControls={props.sortPaginateControlsNoLocation}
          >
            {(paginationProps) => (
              <AnnotationLoader data={paginationProps.data}>
                <SelectableTable
                  {...props}
                  {...paginationProps}
                  onSelectAllRows={(status) =>
                    props.onSelectAllRows(status, { geoLocation: false })
                  }
                  allRowsSelected={allWithoutGeoDataSelected}
                  selectedRowIds={selectedIdsWithoutGeoData}
                  columns={columns}
                  rendererMap={rendererMap}
                  selectable
                  onRowSelect={props.onRowSelect}
                  rowHeight={70}
                  rowClassNames={rowClassNames}
                  rowEventHandlers={rowEventHandlers}
                />
              </AnnotationLoader>
            )}
          </SorterPaginationWrapper>
        </TabPane>
      </StyledTabs>
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
const StyledTabs = styled(Tabs)`
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding-bottom: 13px;
  border: 0;
  height: 100%;
  .ant-tabs-content {
    height: 100%;
  }
`;
