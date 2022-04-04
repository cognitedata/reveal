import { useEffect, useMemo, useState } from 'react';
import { CellProps } from 'react-table';
import { Checkbox, Icon, Table, toast } from '@cognite/cogs.js';
import {
  useAppContext,
  useComponentName,
  useConnectedDataElements,
  useDataPanelDispatch,
} from 'scarlet/hooks';
import {
  AppActionType,
  DataElement,
  DataElementOrigin,
  DataPanelActionType,
  Detection,
} from 'scarlet/types';
import {
  getDataElementConfig,
  getDataElementTypeLabel,
  getDetectionSourceLabel,
} from 'scarlet/utils';

import { Modal } from '../..';

import * as Styled from './style';

type ConnectedElementsModalProps = {
  visible: boolean;
  dataElement: DataElement;
  detection: Detection;
  onClose: () => void;
};

type ConnectedTableRow = {
  id: string;
  label: string;
  type: DataElementOrigin;
  componentName: string;
  isCurrentDataElement: boolean;
  sortBy: number;
  isSelectDisabled: boolean;
};

export const ConnectedElementsModal = ({
  visible,
  dataElement,
  detection,
  onClose,
}: ConnectedElementsModalProps) => {
  const { appState, appDispatch } = useAppContext();
  const dataPanelDispatch = useDataPanelDispatch();
  const [loading, setLoading] = useState(false);
  const connectedElements = useConnectedDataElements(dataElement.key);
  const geComponentName = useComponentName();
  const [selectedDataElementIds, setSelectedDataElementIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (!visible) return;

    if (appState.saveState.error) {
      toast.error('Failed to connect data fields');
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        toast.success(
          `${selectedDataElementIds.length} data fields have been approved`
        );

        onClose();

        dataPanelDispatch({
          type: DataPanelActionType.CLOSE_DATA_ELEMENT,
        });
      }
    }
  }, [appState.saveState]);

  const onApprove = () => {
    setLoading(true);

    appDispatch({
      type: AppActionType.SET_CONNECTED_DATA_ELEMENTS,
      dataElements: connectedElements.filter((dataElement) =>
        selectedDataElementIds.includes(dataElement.id)
      ),
      currentDataElementId: dataElement.id,
      detection,
      isApproved: true,
      isPrimary: true,
    });
  };

  const defaultSelectedIds = useMemo(
    () =>
      connectedElements.reduce(
        (result, item) => ({ ...result, [item.id]: true }),
        {}
      ),
    [connectedElements]
  );

  const tableDataSource = useMemo(
    () =>
      connectedElements
        .map((item) => {
          const dataElementConfig = getDataElementConfig(
            appState.equipmentConfig.data,
            item
          );
          const component = item.componentId
            ? appState.equipment.data?.components.find(
                (component) => component.id === item.componentId
              )
            : undefined;

          const isCurrentDataElement = item.id === dataElement.id;

          return {
            id: item.id,
            label: dataElementConfig.label,
            type: getDataElementTypeLabel(item),
            componentName: component ? geComponentName(component) : '-',
            isCurrentDataElement,
            sortBy: isCurrentDataElement ? 0 : 1,
            isSelectDisabled: isCurrentDataElement,
          } as ConnectedTableRow;
        })
        .sort((a, b) => a.sortBy - b.sortBy),
    [connectedElements]
  );

  const onSelectionChange = (values: ConnectedTableRow[]) => {
    setSelectedDataElementIds((currentSelected) =>
      values.length !== selectedDataElementIds.length
        ? values.map(({ id }) => id)
        : currentSelected
    );
  };

  return (
    <Modal
      title="Set primary value for multiple instances of a field"
      okText={loading ? 'Saving...' : 'Save'}
      visible={visible}
      onOk={onApprove}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
    >
      <Styled.Header className="cogs-body-1">
        Set
        <Styled.Detection>
          <Styled.DetectionSource className="cogs-micro strong">
            {getDetectionSourceLabel(detection)}
          </Styled.DetectionSource>
          <Styled.DetectionValue className="cogs-body-2 strong">
            {detection.value}
          </Styled.DetectionValue>
        </Styled.Detection>
        as primary value for the following data fields
      </Styled.Header>
      <Styled.TableContainer>
        <Table<ConnectedTableRow>
          dataSource={tableDataSource}
          columns={
            [
              {
                Header: SelectHeader,
                accessor: 'sortBy',
                Cell: SelectCell,
                disableSortBy: true,
              },
              {
                Header: 'Field name',
                accessor: 'label',
              },
              {
                Header: 'Field level',
                accessor: 'type',
              },
              {
                Header: 'Component ID',
                accessor: 'componentName',
              },
              {
                Header: '',
                accessor: 'isCurrentDataElement',
                Cell: CurrenField,
              },
            ] as any
          }
          pagination={false}
          rowKey={(row) => row.id}
          onRow={({ isSelectDisabled }, _index, row: any) => ({
            onClick: () => {
              if (!isSelectDisabled) {
                row?.toggleRowSelected();
              }
            },
          })}
          defaultSelectedIds={defaultSelectedIds}
          onSelectionChange={onSelectionChange}
        />
      </Styled.TableContainer>
    </Modal>
  );
};

const CurrenField = ({ value }: CellProps<ConnectedTableRow, boolean>) =>
  value ? (
    <Styled.CurrentField>
      <Icon type="Pin" />
      Current field
    </Styled.CurrentField>
  ) : null;

const SelectHeader = ({ isAllRowsSelected, rows }: any) => {
  const isSomeSelected =
    !isAllRowsSelected && rows.some((row: any) => row.isSelected);

  return (
    <Styled.SelectHeader>
      <Checkbox
        name="select-all-connected-fields"
        checked={isSomeSelected || isAllRowsSelected}
        indeterminate={isSomeSelected}
        onClick={(e) => e.stopPropagation()}
        onChange={() => {
          if (isSomeSelected) {
            rows.forEach((row: any) => row.toggleRowSelected(true));
          } else if (isAllRowsSelected) {
            rows.forEach((row: any) => {
              if (!row.original.isSelectDisabled) {
                row.toggleRowSelected(false);
              }
            });
          }
        }}
      />
    </Styled.SelectHeader>
  );
};

const SelectCell = ({ row }: any) => (
  <Checkbox
    name={`connected-field-${row.id}`}
    checked={row.isSelected}
    disabled={row.original.isSelectDisabled}
    onClick={(e) => e.stopPropagation()}
    onChange={() => {
      if (!row.original.isSelectDisabled) {
        row.toggleRowSelected();
      }
    }}
  />
);
