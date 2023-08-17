import { useMemo, useState } from 'react';

import RowActions from '@data-catalog-app/components/data-sets-list/row-actions';
import Page from '@data-catalog-app/components/page';
import TableFilter, {
  GovernanceStatus,
} from '@data-catalog-app/components/table-filters';
import { useHandleFilters } from '@data-catalog-app/utils/filterUtils';
import isArray from 'lodash/isArray';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { TableNoResults } from '@cognite/cdf-utilities';
import { Button, Flex, Icon, Chip, Checkbox, Table } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  DataSetWithExtpipes,
  useDataSetsList,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useTranslation } from '../../common/i18n';
import { useDataSetMode, useSelectedDataSet } from '../../context/index';
import useDiscardChangesToast from '../../hooks/useDiscardChangesToast';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useSearchParamState } from '../../hooks/useSearchParamState';
import { useWithExtpipes } from '../../hooks/useWithExtpipes';
import { CogsTableCellRenderer, trackUsage } from '../../utils';
import DataSetEditor from '../DataSetEditor';

import { useTableColumns, DataSetRow, getLabelsList } from './TableColumns';

const DataSetsList = (): JSX.Element => {
  const { t } = useTranslation();
  const { handleDataSetsFilters } = useHandleFilters();
  const { getTableColumns } = useTableColumns();
  const { data: withExtpipes, isFetched: didFetchWithExtpipes } =
    useWithExtpipes();

  const [creationDrawerVisible, setCreationDrawerVisible] =
    useState<boolean>(false);
  const [showArchived, setShowArchived] = useLocalStorage<boolean>(
    'data-sets-show-archived',
    false
  );
  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const [userWarned, setUserWarned] = useState<boolean>(false);

  const searchFilter = useSearchParamState<string>('search');
  const labelFilter = useSearchParamState<string[]>('labels');
  const governanceFilter =
    useSearchParamState<GovernanceStatus[]>('governance');

  const { setMode } = useDataSetMode();

  const { setSelectedDataSet } = useSelectedDataSet();

  const {
    dataSetsWithExtpipes = [],
    isExtpipesFetched,
    isFetched: didFetchDataSets,
    isLoading: loading,
  } = useDataSetsList();
  const { updateDataSetVisibility, isLoading: isUpdatingDataSetVisibility } =
    useUpdateDataSetVisibility();

  const { flow } = getFlow();
  const { data: hasWritePermissions } = usePermissions(
    flow,
    'datasetsAcl',
    'WRITE'
  );

  const dataSetsList = useMemo(() => {
    return handleDataSetsFilters(
      showArchived,
      searchFilter,
      governanceFilter,
      dataSetsWithExtpipes
    );
  }, [
    handleDataSetsFilters,
    showArchived,
    searchFilter,
    governanceFilter,
    dataSetsWithExtpipes,
  ]);

  const tableData = useMemo(() => {
    let tableDataSets: DataSetRow[] = [];
    if (dataSetsWithExtpipes?.length && !loading) {
      tableDataSets = dataSetsList.map(
        (dataSetWithExtpipes: DataSetWithExtpipes): DataSetRow => {
          const { dataSet, extpipes } = dataSetWithExtpipes;
          const labelsFromMetadata = dataSet.metadata?.consoleLabels;
          return {
            key: dataSet.id,
            id: dataSet.id,
            externalId: dataSet.externalId,
            name: dataSet.name,
            description: dataSet.description,
            labels: isArray(labelsFromMetadata) ? labelsFromMetadata : [],
            quality: dataSet.metadata.consoleGoverned,
            extpipes,
            writeProtected: dataSet.writeProtected,
            archived:
              dataSet.metadata.archived !== undefined
                ? dataSet.metadata.archived
                : false,
          };
        }
      );
    }
    return tableDataSets;
  }, [dataSetsWithExtpipes, loading, dataSetsList]);

  const filteredTableData = useMemo(() => {
    let filteredArray = tableData;
    if (labelFilter?.length) {
      filteredArray = filteredArray.filter(({ labels: testLabels }) =>
        testLabels.some((label) => labelFilter.includes(label))
      );
    }
    return filteredArray;
  }, [labelFilter, tableData]);

  const labels = useMemo(() => {
    return getLabelsList(
      dataSetsWithExtpipes.map(({ dataSet }) => dataSet),
      showArchived
    );
  }, [dataSetsWithExtpipes, showArchived]);

  const handleModalClose = () => {
    setCreationDrawerVisible(false);
    setMode('create');
    setSelectedDataSet(undefined);
  };

  const getSourcesList = () => {
    const sourceNames: string[] = [];
    dataSetsWithExtpipes.forEach(({ dataSet }) => {
      if (dataSet?.metadata?.consoleSource?.names?.length)
        dataSet.metadata.consoleSource.names.forEach((name: string) => {
          if (!sourceNames.includes(name)) {
            sourceNames.push(name);
          }
        });
    });
    return sourceNames;
  };

  const statusColumn = {
    Header: t('status'),
    id: 'status',
    width: '5%',
    maxWidth: 20,
    Cell: ({ row: { original: record } }: CogsTableCellRenderer<DataSetRow>) =>
      record.archived && (
        <Chip size="medium" type="danger" label={t('archived')} />
      ),
  };

  const actionsColumn = {
    accessor: 'options',
    id: 'options',
    Header: '',
    maxWidth: 50,
    Cell: ({
      row: { original: record },
    }: CogsTableCellRenderer<DataSetRow>) => (
      <div
        onClick={(evt) => {
          evt.stopPropagation();
        }}
      >
        <RowActions
          loading={isUpdatingDataSetVisibility || loading}
          actions={[
            {
              children: t('edit'),
              onClick: () => {
                trackUsage({
                  e: 'data.sets.edit.click',
                  dataSetId: record.key,
                });
                editDataSet(record.key);
              },
              disabled: !hasWritePermissions,

              icon: 'Edit',
            },
            {
              children: record.archived ? t('restore') : t('archive'),
              onClick: () => {
                if (record.archived) {
                  trackUsage({
                    e: 'data.sets.archive.click',
                    dataSetId: record.key,
                  });
                  return restoreDataSet(record.key);
                }
                trackUsage({
                  e: 'data.sets.restore.click',
                  dataSetId: record.key,
                });
                return archiveDataSet(record.key);
              },
              disabled: !hasWritePermissions,
              icon: record.archived ? 'Restore' : 'Archive',
            },
          ]}
        />
      </div>
    ),
    width: '52px',
  };

  const dataSetsTableColumns = useMemo(() => {
    return [
      ...getTableColumns(withExtpipes, isExtpipesFetched),
      ...(showArchived ? [statusColumn] : []),
      actionsColumn,
    ] as any;
  }, [withExtpipes, showArchived, statusColumn]);

  const archiveDataSet = (key: number) => {
    const d = dataSetsWithExtpipes.find((curDs) => curDs.dataSet.id === key);
    if (d) {
      updateDataSetVisibility(d.dataSet, true);
    }
  };

  const restoreDataSet = (key: number) => {
    const d = dataSetsWithExtpipes.find((curDs) => curDs.dataSet.id === key);
    if (d) {
      updateDataSetVisibility(d.dataSet, false);
    }
  };

  const editDataSet = (key: number) => {
    setMode('edit');
    setSelectedDataSet(key);
    trackEvent('DataSets.EditingFlow.Starts editing data set');
    setCreationDrawerVisible(true);
  };

  const CreateButton = (
    <Button
      type="primary"
      icon="Add"
      onClick={() => {
        setCreationDrawerVisible(true);
        trackUsage({ e: 'data.sets.create.click' });
        setUserWarned(false);
      }}
      disabled={!hasWritePermissions}
    >
      {t('create-data-set')}
    </Button>
  );

  const onDiscardClick = () => {
    setCreationDrawerVisible(false);
    setMode('create');
    setSelectedDataSet(undefined);
    setChangesSaved(true);
  };

  const openDiscardChangesToast = useDiscardChangesToast({ onDiscardClick });

  const onClose = () => {
    if (userWarned || changesSaved) {
      setCreationDrawerVisible(false);
      setMode('create');
      setSelectedDataSet(undefined);
    } else {
      openDiscardChangesToast();
    }
  };

  if (!didFetchWithExtpipes || !didFetchDataSets) {
    return (
      <div className="loader-wrapper">
        <Icon type="Loader" size={32} />
      </div>
    );
  }

  return (
    <Page title={t('landing-title')}>
      <DataSetEditor
        visible={creationDrawerVisible}
        onClose={onClose}
        changesSaved={changesSaved}
        setChangesSaved={setChangesSaved}
        sourceSuggestions={getSourcesList()}
        handleCloseModal={() => handleModalClose()}
      />
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: 16 }}
        key="table-filters-wrapper"
      >
        <TableFilter
          filteredCount={filteredTableData.length}
          labelOptions={labels}
          totalCount={dataSetsWithExtpipes.length}
        />
        <Flex alignItems="center" gap={8}>
          <Checkbox
            onChange={(e, isChecked) => {
              setShowArchived(isChecked);
              trackUsage({ e: 'data.sets.view.archive.click' });
            }}
            checked={showArchived}
          >
            {t('show-archived-data-sets')}
          </Checkbox>
          {CreateButton}
        </Flex>
      </Flex>
      <div className="data-sets-list-table">
        <Table<DataSetRow>
          key="data-sets-table"
          columns={dataSetsTableColumns}
          dataSource={filteredTableData}
          locale={{
            emptyText: (
              <TableNoResults
                title={t('data-set-list-no-records')}
                content={t('data-set-list-search-not-found', {
                  $: searchFilter ? `"${searchFilter}"` : searchFilter,
                })}
              />
            ),
          }}
        />
      </div>
    </Page>
  );
};

export default DataSetsList;
