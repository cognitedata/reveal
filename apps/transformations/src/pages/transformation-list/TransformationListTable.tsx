import { Key, useMemo, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import DeleteTransformationModal from '@transformations/components/delete-transformation-modal';
import LastRunStatus from '@transformations/components/transformation-list/last-run-status/LastRunStatus';
import TableOptions from '@transformations/components/transformation-list/table-options/TableOptions';
import TransformationDataSet from '@transformations/components/transformation-list/transformation-data-set/TransformationDataSet';
import TransformationName from '@transformations/components/transformation-list/transformation-name/TransformationName';
import TransformationSchedule from '@transformations/components/transformation-list/transformation-schedule/TransformationSchedule';
import { useDeleteTransformation } from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';
import {
  dateSorter,
  isTruthy,
  stringSorter,
  getTrackEvent,
  getContainer,
} from '@transformations/utils';
import { notification } from 'antd';

import { trackEvent } from '@cognite/cdf-route-tracker';
import {
  Table,
  TableNoResults,
  ColumnType,
  RowSelectionType,
  SortOrder,
  Timestamp,
} from '@cognite/cdf-utilities';
import { Body } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

import TransformationActionBar from './TransformationActionBar';
import { ColumnState, FiltersState } from './TransformationList';

type TransformationListTableProps = {
  dataSets: DataSet[];
  transformationList: TransformationRead[];
  filterState: FiltersState['applied'];
  columnStates: ColumnState[];
};

export type TransformationListTableRecord = {
  key: string;
  hasCredentials: boolean;
} & Pick<
  TransformationRead,
  | 'id'
  | 'name'
  | 'blocked'
  | 'conflictMode'
  | 'createdTime'
  | 'dataSetId'
  | 'destination'
  | 'lastFinishedJob'
  | 'lastUpdatedTime'
  | 'runningJob'
  | 'schedule'
  | 'isPublic'
  | 'ignoreNullFields'
  | 'query'
>;

export const TRANSFORMATION_LIST_COLUMN_KEYS = [
  'name',
  'data-set',
  'last-modified',
  'schedule',
  'last-run',
  'created',
] as const;

export type TransformationListColumnKey =
  (typeof TRANSFORMATION_LIST_COLUMN_KEYS)[number];

type TransformationListColumn = ColumnType<TransformationListTableRecord> & {
  title: string;
} & {
  key: TransformationListColumnKey | 'options';
};

const getTransformationListRowKey = (
  transformationId: TransformationRead['id']
): string => {
  return `transformation-${transformationId}`;
};

const TransformationListTable = ({
  dataSets,
  transformationList,
  filterState,
  columnStates,
}: TransformationListTableProps): JSX.Element => {
  const { t } = useTranslation();
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const { mutate: deleteTransformation, isLoading: isDeletingTransformation } =
    useDeleteTransformation();

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const handleToggleCheckbox = (
    _: Key[],
    selectedRows: TransformationListTableRecord[]
  ) => {
    setSelectedRowKeys(selectedRows.map(({ key }) => key));
  };

  const columns: TransformationListColumn[] = useMemo(
    () => [
      {
        title: t('transformation-list-table-column-title-name'),
        dataIndex: 'name',
        key: 'name',
        render: (value, record) => (
          <TransformationName id={record.id} name={value} />
        ),
        sorter: (a, b) => stringSorter(a, b, 'name'),
      },
      {
        title: t('transformation-list-table-column-title-data-set'),
        dataIndex: 'dataSetId',
        key: 'data-set',
        render: (value) =>
          !!value && (
            <Body level={2} strong>
              <TransformationDataSet dataSetId={value} />
            </Body>
          ),
        sorter: (a, b) => {
          const dataSetA = dataSets.find(
            ({ id: testId }) => a.dataSetId === testId
          );
          const identifierA = dataSetA?.name ?? dataSetA?.externalId ?? '';
          const dataSetB = dataSets.find(
            ({ id: testId }) => b.dataSetId === testId
          );
          const identifierB = dataSetB?.name ?? dataSetB?.externalId ?? '';
          return identifierA.localeCompare(identifierB);
        },
      },
      {
        title: t('transformation-list-table-column-title-last-modified'),
        dataIndex: 'lastUpdatedTime',
        key: 'last-modified',
        render: (value) => <Timestamp timestamp={value} />,
        sorter: (a, b) => dateSorter(a.lastUpdatedTime, b.lastUpdatedTime),
      },
      {
        title: t('transformation-list-table-column-title-schedule'),
        dataIndex: 'schedule',
        key: 'schedule',
        render: (value, record) => (
          <TransformationSchedule blocked={record.blocked} schedule={value} />
        ),
      },
      {
        title: t('transformation-list-table-column-title-last-run'),
        dataIndex: 'lastFinishedJob',
        key: 'last-run',
        render: (value, record) => (
          <LastRunStatus
            lastFinishedJob={value}
            runningJob={record.runningJob}
          />
        ),
        sorter: (a, b) => {
          const timeA =
            a.runningJob?.finishedTime ??
            a.runningJob?.startedTime ??
            a.lastFinishedJob?.finishedTime;
          const timeB =
            b.runningJob?.finishedTime ??
            b.runningJob?.startedTime ??
            b.lastFinishedJob?.finishedTime;

          return dateSorter(timeA, timeB);
        },
      },
      {
        title: t('transformation-list-table-column-title-created'),
        dataIndex: 'createdTime',
        key: 'created',
        render: (value) => <Timestamp timestamp={value} />,
        sorter: (a, b) => dateSorter(a.createdTime, b.createdTime),
      },
    ],
    [dataSets, t]
  );

  const filteredColumns = useMemo(() => {
    const filtered: TransformationListColumn[] = [];
    columnStates.forEach(({ key, selected }) => {
      if (selected) {
        const column = columns.find(({ key: tK }) => tK === key);
        if (column) {
          filtered.push(column);
        }
      }
    });
    filtered.push({
      dataIndex: 'options',
      key: 'options',
      title: '',
      render: (_, record) => (
        <div
          onClick={(evt) => {
            trackEvent(getTrackEvent('event-tr-list-more-action-click'));
            evt.stopPropagation();
          }}
        >
          <TableOptions
            transformation={record}
            onDelete={() => record.id && setDeleteModalId(record.id)}
          />
        </div>
      ),
      width: '52px',
    });
    return filtered;
  }, [columns, columnStates]);

  const { search } = filterState;
  const defaultSort: [TransformationListColumnKey, SortOrder] = [
    'last-modified',
    'descend',
  ];

  const dataSource = transformationList.map((transformation) => {
    const {
      blocked,
      createdTime,
      conflictMode,
      dataSetId,
      destination,
      id,
      lastFinishedJob,
      lastUpdatedTime,
      name,
      runningJob,
      schedule,
      isPublic,
      ignoreNullFields,
      query,
      hasDestinationApiKey,
      hasDestinationOidcCredentials,
      hasSourceApiKey,
      hasSourceOidcCredentials,
    } = transformation;

    return {
      key: getTransformationListRowKey(id),
      id,
      name,
      blocked,
      conflictMode,
      createdTime,
      dataSetId,
      destination,
      lastFinishedJob,
      lastUpdatedTime,
      runningJob,
      schedule,
      isPublic,
      ignoreNullFields,
      query,
      hasCredentials:
        (hasDestinationApiKey && hasSourceApiKey) ||
        (hasDestinationOidcCredentials && hasSourceOidcCredentials),
    };
  });

  const selectedRows = dataSource.filter(({ key }) =>
    selectedRowKeys.includes(key)
  );

  const closeDeleteModal = () => setDeleteModalId(null);
  const deleteTargetName = transformationList.find(
    (tr) => tr.id === deleteModalId
  )?.name;
  const startDeleteTransformation = () => {
    if (deleteModalId) {
      deleteTransformation([deleteModalId], {
        onError: () => {
          notification.error({
            message: t('transformation-delete-notification-error', {
              count: 1,
              namesOrIds: deleteTargetName,
            }),
          });
        },
        onSuccess: () => {
          notification.success({
            message: t('transformation-delete-notification-success', {
              count: 1,
              namesOrIds: deleteTargetName,
            }),
          });
          closeDeleteModal();
        },
      });
    }
  };

  const onClose = () => {
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    type: 'checkbox' as RowSelectionType,
    onChange: handleToggleCheckbox,
  };

  const transformationToDelete = transformationList.find(
    (tr) => tr.id === deleteModalId
  );

  const onSort = (key: string, direction: SortOrder) => {
    const sortColumnEvent: Record<string, string> = {
      name: getTrackEvent('event-tr-list-sort-column-name-click'),
      dataSetId: getTrackEvent('event-tr-list-sort-column-dataset-click'),
      lastUpdatedTime: getTrackEvent(
        'event-tr-list-sort-column-last-modified-click'
      ),
      lastFinishedJob: getTrackEvent(
        'event-tr-list-sort-column-last-run-click'
      ),
      createdTime: getTrackEvent('event-tr-list-sort-column-create-time-click'),
    };
    trackEvent(sortColumnEvent[key], {
      direction,
    });
  };

  return (
    <StyledTableContainer $isActionBarVisible={!!selectedRows.length}>
      <Table<TransformationListTableRecord>
        columns={filteredColumns as any}
        onSort={onSort}
        appendTooltipTo={getContainer()}
        dataSource={dataSource}
        rowSelection={rowSelection}
        defaultSort={defaultSort}
        emptyContent={
          <TableNoResults
            title={t('transformation-list-no-records')}
            content={t('transformation-list-search-not-found', {
              $: search !== '' ? `"${search}"` : search,
            })}
          />
        }
      />
      {!!deleteModalId && (
        <DeleteTransformationModal
          handleClose={closeDeleteModal}
          handleDelete={startDeleteTransformation}
          items={[transformationToDelete].filter(isTruthy)}
          isEmpty={
            transformationToDelete &&
            !transformationToDelete.query &&
            !transformationToDelete.lastFinishedJob
          }
          visible={!!deleteModalId}
          loading={isDeletingTransformation}
        />
      )}
      <TransformationActionBar selectedRows={selectedRows} onClose={onClose} />
    </StyledTableContainer>
  );
};

const StyledTableContainer = styled.div<{ $isActionBarVisible?: boolean }>`
  overflow-y: auto;
  padding-bottom: ${({ $isActionBarVisible }) =>
    $isActionBarVisible ? 56 : 0}px;

  .ant-table-cell {
    white-space: nowrap;
  }
`;

export default TransformationListTable;
