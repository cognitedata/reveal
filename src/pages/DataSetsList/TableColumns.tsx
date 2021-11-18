import React from 'react';
import { stringCompare } from 'utils/utils';
import WriteProtectedIcon from 'components/WriteProtectedIcon';
import {
  ApprovedDot,
  LabelTag,
  NoStyleList,
  NotSetDot,
  UnApprovedDot,
} from 'utils/styledComponents';
import SearchableFilters from 'components/SearchableFilters';
import { getItemFromStorage } from 'utils/localStorage';
import { DataSet, Integration } from 'utils/types';
import { IntegrationLink } from 'components/Lineage/Integration/IntegrationLink';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import { ColumnFilterIcon } from 'components/ColumnFilterIcon';
import isArray from 'lodash/isArray';

export interface DataSetRow {
  key: number;
  name: string;
  labels: string[];
  quality?: boolean;
  description: string;
  integrations: Integration[];
  writeProtected: boolean;
  archived: boolean;
}

const getFilterDropdown = (filterProps: FilterDropdownProps) => (
  <SearchableFilters {...filterProps} />
);

const getLabelsList = (dataSets: DataSet[], showArchived: boolean) => {
  const labels: string[] = [];
  let dataSetsList = dataSets;
  if (!showArchived) {
    dataSetsList = dataSets.filter((set) => set.metadata.archived !== true);
  }
  dataSetsList.forEach((dataSet) => {
    if (isArray(dataSet.metadata.consoleLabels))
      dataSet.metadata.consoleLabels.forEach((label) => {
        if (!labels.includes(label)) {
          labels.push(label);
        }
      });
  });

  return labels.sort();
};

const getTableColumns = (
  dataSets: DataSet[],
  showArchived: boolean,
  isIntegrationFlag: boolean
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'dataset-name-column',
    width: '20%',
    sorter: (a: DataSetRow, b: DataSetRow) => stringCompare(a.name, b.name),
    render: (_value: string, record: DataSetRow) => (
      <span>
        {record.writeProtected && <WriteProtectedIcon />}
        {record.name}
      </span>
    ),
    defaultSortOrder: getItemFromStorage('dataset-name-column') || undefined,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'dataset-description-column',
    render: (_value: string, record: DataSetRow) => (
      <span>{record.description}</span>
    ),
    sorter: (a: DataSetRow, b: DataSetRow) =>
      stringCompare(a.description, b.description),

    width: '30%',
    defaultSortOrder:
      getItemFromStorage('dataset-description-column') || undefined,
  },
  ...(isIntegrationFlag ? [integrationTableColumn()] : []),
  {
    title: <div style={{ lineHeight: '32px' }}>Labels</div>,
    dataIndex: 'labels',
    key: 'labels',
    width: '30%',
    filterIcon: (filtered: boolean) => <ColumnFilterIcon filtered={filtered} />,
    filters: getLabelsList(dataSets, showArchived).map((val) => ({
      text: val,
      value: val,
    })),
    filterDropdown: (filterProps: FilterDropdownProps) =>
      getFilterDropdown(filterProps),
    onFilter: (value: any, record: any) => record.labels.includes(value),
    render: (field: []) => (
      <span>
        {field?.length ? (
          field.map((label: string) => <LabelTag key={label}>{label}</LabelTag>)
        ) : (
          <p style={{ fontStyle: 'italic' }}>No labels</p>
        )}
      </span>
    ),
  },
  {
    title: 'Governance status',
    key: 'quality',
    width: '15%',
    render: (row: DataSetRow) => (
      <div style={{ display: 'inline-box' }}>
        {row.quality === undefined && (
          <span>
            <NotSetDot /> Not defined
          </span>
        )}
        {row.quality && (
          <span>
            <ApprovedDot /> Governed
          </span>
        )}
        {row.quality === false && (
          <span>
            <UnApprovedDot /> Ungoverned
          </span>
        )}
      </div>
    ),
  },
];

const integrationTableColumn = () => {
  return {
    title: 'Extraction pipelines',
    dataIndex: 'integrations',
    key: 'integrations',
    width: '20%',
    render: (_value: string, record: DataSetRow) => {
      return (
        <NoStyleList>
          {record.integrations &&
            record.integrations.map((integration) => {
              return (
                <li key={integration.id}>
                  <IntegrationLink integration={integration} />
                </li>
              );
            })}
        </NoStyleList>
      );
    },
  };
};
export default getTableColumns;
