import React, { useMemo } from 'react';
import {
  FileMapTableProps,
  MapTableTabKey,
} from 'src/modules/Common/Components/FileTable/types';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import styled from 'styled-components';
import { ColumnShape } from 'react-base-table';
import { NameAndAnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameAndAnnotation';
import { Tabs } from 'antd';
import { LoadingTable } from 'src/modules/Common/Components/LoadingRenderer/LoadingTable';
import { NoData } from 'src/modules/Common/Components/NoData/NoData';

const { TabPane } = Tabs;

type MapTableProps = FileMapTableProps<TableDataItem> & {
  mapTableTabKey: MapTableTabKey;
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
    return `clickable ${props.focusedFileId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onRowClick(rowData as ResultData);
      props.mapCallback(rowData.id);
    },
  };

  const overlayRenderer = () =>
    props.isLoading ? <LoadingTable columns={columns} /> : <></>;
  const emptyRenderer = () => (props.isLoading ? <></> : <NoData />);

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
          <SelectableTable
            {...props}
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
            overlayRenderer={overlayRenderer}
            emptyRenderer={emptyRenderer}
          />
        </TabPane>

        <TabPane tab="Files without location" key="filesWithoutMap">
          <SelectableTable
            {...props}
            data={withOutGeoData}
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
            emptyRenderer={emptyRenderer}
            overlayRenderer={overlayRenderer}
          />
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
