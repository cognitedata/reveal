import { useMemo } from 'react';
import { CellProps } from 'react-table';
import { Checkbox, Icon, Table } from '@cognite/cogs.js';
import { useAppContext } from 'hooks';
import {
  DataElement,
  DataElementOrigin,
  Detection,
  DetectionType,
} from 'types';
import {
  getDataElementHasDiscrepancy,
  getDataElementTypeLabel,
  getDetectionSourceAcronym,
  getPrintedDataElementValue,
} from 'utils';
import capitalize from 'lodash/capitalize';

import * as Styled from './style';

type ConnectedElementsProps = {
  dataElement: DataElement;
  detection: Detection;
  connectedElements: DataElement[];
  onChange: (ids: string[]) => void;
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

export const ConnectedElements = ({
  dataElement,
  detection,
  connectedElements,
  onChange,
}: ConnectedElementsProps) => {
  const { appState } = useAppContext();
  const isDiscrepancy = useMemo(
    () => getDataElementHasDiscrepancy(dataElement),
    [dataElement]
  );

  const defaultSelectedIds = useMemo(
    () =>
      connectedElements.reduce((result, connectedElement) => {
        const isSelected =
          connectedElement.id === dataElement.id ||
          connectedElement.detections.find(
            (d) =>
              d.type === DetectionType.LINKED &&
              d.detectionOriginId === detection.id
          );
        return { ...result, [connectedElement.id]: isSelected };
      }, {}),
    [connectedElements]
  );

  const tableDataSource = useMemo(
    () =>
      connectedElements
        .map((item) => {
          const component = item.componentId
            ? appState.equipment.data?.components.find(
                (component) => component.id === item.componentId
              )
            : undefined;

          const isCurrentDataElement = item.id === dataElement.id;
          const type = component?.type
            ? capitalize(component.type)
            : getDataElementTypeLabel(item);

          return {
            id: item.id,
            label: item.config.label,
            type,
            componentName: component ? component.name : '-',
            isCurrentDataElement,
            sortBy: isCurrentDataElement ? 0 : 1,
            isSelectDisabled: isCurrentDataElement,
          } as ConnectedTableRow;
        })
        .sort((a, b) => a.sortBy - b.sortBy),
    [connectedElements]
  );

  const onSelectionChange = (values: ConnectedTableRow[]) => {
    onChange(values.map(({ id }) => id));
  };
  return (
    <>
      <Styled.Header className="cogs-body-1">
        Set
        <Styled.Detection>
          <Styled.DetectionSource
            isPrimary={detection.isPrimary}
            className="cogs-micro strong"
          >
            {getDetectionSourceAcronym(detection)}
            {isDiscrepancy && !detection.isPrimary && (
              <Icon type="WarningTriangle" size={8} />
            )}
            {isDiscrepancy && detection.isPrimary && (
              <Icon type="Info" size={10} />
            )}
          </Styled.DetectionSource>
          <Styled.DetectionValue className="cogs-body-2 strong">
            {getPrintedDataElementValue(
              detection.value!,
              dataElement.config.unit,
              dataElement.config.type
            )}
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
    </>
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
