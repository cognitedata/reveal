import { Icon } from '@cognite/cogs.js';
import { stringCompare } from 'utils/shared';
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
import { DataSet, Extpipe } from 'utils/types';
import { ExtpipeLink } from 'components/Lineage/Extpipe/ExtpipeLink';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import { ColumnFilterIcon } from 'components/ColumnFilterIcon';
import isArray from 'lodash/isArray';
import { useTranslation } from 'common/i18n';

export interface DataSetRow {
  key: number;
  name: string;
  labels: string[];
  quality?: boolean;
  description: string;
  extpipes: Extpipe[];
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

export const useTableColumns = () => {
  const { t } = useTranslation();

  const getTableColumns = (
    dataSets: DataSet[],
    showArchived: boolean,
    isExtpipeFlag: boolean,
    isExtpipesFetched?: boolean
  ) => [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'dataset-name-column',
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
      title: t('description'),
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
    ...(isExtpipeFlag ? [extpipeTableColumn(isExtpipesFetched)] : []),
    {
      title: <div style={{ lineHeight: '32px' }}>{t('label_other')}</div>,
      dataIndex: 'labels',
      key: 'labels',
      filterIcon: (filtered: boolean) => (
        <ColumnFilterIcon filtered={filtered} />
      ),
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
            field.map((label: string) => (
              <LabelTag key={label}>{label}</LabelTag>
            ))
          ) : (
            <p style={{ fontStyle: 'italic' }}>{t('no-labels')}</p>
          )}
        </span>
      ),
    },
    {
      title: t('governance-status'),
      key: 'quality',
      render: (row: DataSetRow) => (
        <div style={{ display: 'inline-box' }}>
          {row.quality === undefined && (
            <span>
              <NotSetDot /> {t('not-defined')}
            </span>
          )}
          {row.quality && (
            <span>
              <ApprovedDot /> {t('governed')}
            </span>
          )}
          {row.quality === false && (
            <span>
              <UnApprovedDot /> {t('ungoverned')}
            </span>
          )}
        </div>
      ),
    },
  ];

  const extpipeTableColumn = (isExtpipesFetched?: boolean) => {
    return {
      title: t('extraction-pipelines'),
      dataIndex: 'extpipes',
      key: 'extpipes',
      render: (_value: string, record: DataSetRow) => {
        if (!isExtpipesFetched) {
          return <Icon type="Loader" />;
        }

        return (
          <NoStyleList>
            {Array.isArray(record.extpipes) &&
              record.extpipes.map((extpipe) => {
                return (
                  <li key={extpipe.id}>
                    <ExtpipeLink extpipe={extpipe} />
                  </li>
                );
              })}
          </NoStyleList>
        );
      },
    };
  };
  return { getTableColumns };
};
