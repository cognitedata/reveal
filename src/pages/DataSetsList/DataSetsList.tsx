import { useMemo, useState } from 'react';
import { Button, Icon, Input } from '@cognite/cogs.js';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import Tag from 'antd/lib/tag';
import { notification } from 'antd';
import Checkbox from 'antd/lib/checkbox';
import DataSetEditor from 'pages/DataSetEditor';
import { Dropdown, DropdownMenuContent } from 'components/DropdownMenu';

import { trackEvent } from '@cognite/cdf-route-tracker';
import SelectorFilter from 'components/SelectorFilter';
import { useHandleFilters } from 'utils/filterUtils';
import { setItemInStorage } from 'utils/localStorage';
import { getContainer } from 'utils/shared';
import useLocalStorage from 'hooks/useLocalStorage';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import isArray from 'lodash/isArray';
import { useTableColumns, DataSetRow } from './TableColumns';
import {
  DataSetWithExtpipes,
  useDataSetsList,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useWithExtpipes } from '../../hooks/useWithExtpipes';
import { useDataSetMode, useSelectedDataSet } from '../../context/index';
import { useTranslation } from 'common/i18n';
import Page from 'components/page';

const DataSetsList = (): JSX.Element => {
  const { t } = useTranslation();
  const { handleDataSetsFilters } = useHandleFilters();
  const { getTableColumns } = useTableColumns();
  const { data: withExtpipes, isFetched: didFetchWithExtpipes } =
    useWithExtpipes();

  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [searchValue, setSearchValue] = useLocalStorage<string>(
    'data-sets-search',
    ''
  );
  const [creationDrawerVisible, setCreationDrawerVisible] =
    useState<boolean>(false);
  const [showArchived, setShowArchived] = useLocalStorage<boolean>(
    'data-sets-show-archived',
    false
  );
  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const [userWarned, setUserWarned] = useState<boolean>(false);

  const { setMode } = useDataSetMode();

  const { setSelectedDataSet } = useSelectedDataSet();

  const {
    dataSetsWithExtpipes = [],
    isExtpipesFetched,
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

  const tableData = useMemo(() => {
    let tableDataSets: DataSetRow[] = [];
    if (dataSetsWithExtpipes?.length && !loading) {
      const dataSetsList = handleDataSetsFilters(
        showArchived,
        searchValue,
        setSearchValue,
        qualityFilter,
        dataSetsWithExtpipes
      );
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
  }, [
    dataSetsWithExtpipes,
    loading,
    qualityFilter,
    searchValue,
    setSearchValue,
    showArchived,
    handleDataSetsFilters,
  ]);

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

  const actionsRender = (_: any, row: DataSetRow) => (
    <Dropdown
      content={
        <DropdownMenuContent
          actions={[
            {
              label: t('edit'),
              onClick: () => {
                editDataSet(row.key);
              },
              disabled: !hasWritePermissions,
              loading: isUpdatingDataSetVisibility || loading,
              icon: 'Edit',
              key: 'edit',
            },
            {
              label: row.archived ? t('restore') : t('archive'),
              onClick: () =>
                row.archived
                  ? restoreDataSet(row.key)
                  : archiveDataSet(row.key),
              disabled: !hasWritePermissions,
              loading: isUpdatingDataSetVisibility || loading,
              icon: row.archived ? 'Restore' : 'Archive',
              key: row.archived ? 'restore' : 'archive',
            },
          ]}
        />
      }
    />
  );

  const statusColumn = {
    title: t('status'),
    key: 'status',
    width: '5%',
    render: (row: DataSetRow) =>
      row.archived && <Tag color="red">{t('archived')}</Tag>,
  };

  const actionsColumn = {
    title: (
      <div style={{ textAlign: 'center', width: '100%' }}>
        {t('action_other')}
      </div>
    ),
    width: '5%',
    key: 'id',
    render: actionsRender,
  };

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

  const discardChangesButton = (
    <div style={{ display: 'block', textAlign: 'right', marginTop: '20px' }}>
      <Button
        type="danger"
        size="small"
        onClick={() => {
          setCreationDrawerVisible(false);
          setMode('create');
          setSelectedDataSet(undefined);
          notification.close('navigateAway');
        }}
      >
        {t('discard-changes')}
      </Button>
    </div>
  );

  const QualitySelector = (
    <SelectorFilter
      filterName="data-sets-governance"
      selectionOptions={[
        { name: t('governed'), value: 'governed' },
        { name: t('ungoverned'), value: 'ungoverned' },
      ]}
      setSelection={setQualityFilter}
      defaultValue={qualityFilter}
    />
  );
  const CreateButton = (
    <Button
      type="primary"
      icon="Add"
      style={{ marginLeft: '20px', marginRight: '20px' }}
      onClick={() => {
        setCreationDrawerVisible(true);
        trackEvent('DataSets.CreationFlow.Starts creating data set');
        setUserWarned(false);
      }}
      disabled={!hasWritePermissions}
    >
      {t('create')}
    </Button>
  );
  const SearchBar = (
    <Input
      placeholder={t('search-by-name-description-or-labels')}
      value={searchValue}
      onChange={(e) => setSearchValue(e.currentTarget.value)}
      icon="Search"
      style={{ width: '300px' }}
    />
  );

  const ActionToolbar = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {CreateButton}
      {QualitySelector}
      <Checkbox
        style={{ marginTop: '10px', marginLeft: '20px' }}
        onChange={(e) => setShowArchived(e.target.checked)}
        checked={showArchived}
      >
        {t('show-archived-data-sets')}
      </Checkbox>
    </div>
  );

  const onClose = () => {
    if (userWarned || changesSaved) {
      setCreationDrawerVisible(false);
      setMode('create');
      setSelectedDataSet(undefined);
    } else {
      notification.warn({
        message: 'Warning',
        description: (
          <div>
            {t(
              'you-have-unsaved-changes-are-you-sure-you-want-to-navigate-away'
            )}
            {discardChangesButton}
          </div>
        ),
        key: 'navigateAway',
        getContainer,
      });
    }
  };

  if (!didFetchWithExtpipes) {
    return <Icon type="Loader" />;
  }

  return (
    <Page title={t('data-set_other')}>
      <DataSetEditor
        visible={creationDrawerVisible}
        onClose={onClose}
        changesSaved={changesSaved}
        setChangesSaved={setChangesSaved}
        sourceSuggestions={getSourcesList()}
        handleCloseModal={() => handleModalClose()}
      />
      <div style={{ alignItems: 'center', display: 'flex' }} />
      <Table
        rowKey="key"
        loading={loading}
        columns={[
          ...getTableColumns(
            dataSetsWithExtpipes.map((x) => x.dataSet),
            showArchived,
            withExtpipes,
            isExtpipesFetched
          ),
          ...(showArchived ? [statusColumn] : []),
          actionsColumn,
        ]}
        dataSource={tableData}
        rowClassName={() => 'pointerMouse'}
        onChange={(_pagination, _filters, sorter) => {
          if (!isArray(sorter) && sorter?.columnKey && sorter?.order)
            setItemInStorage(sorter?.columnKey, sorter?.order);
        }}
        getPopupContainer={getContainer}
        emptyContent={
          <TableNoResults
            title={t('data-set-list-no-records')}
            content={t('data-set-list-search-not-found', {
              // $: search !== '' ? `"${search}"` : search,
            })}
          />
        }
        appendTooltipTo={getContainer()}
      />
    </Page>
  );
};

export default DataSetsList;
