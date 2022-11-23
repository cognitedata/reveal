import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';

import copy from 'copy-to-clipboard';

import { notification } from 'antd';
import Spin from 'antd/lib/spin';

import Tabs from 'antd/lib/tabs';
import { Button, Flex, Tooltip } from '@cognite/cogs.js';

import DataSetEditor from 'pages/DataSetEditor';
import ExploreData from 'components/Data/ExploreData';
import Lineage from 'components/Lineage';
import DocumentationsTab from 'components/DocumentationsTab';
import AccessControl from 'components/AccessControl';

import { ErrorMessage } from 'components/ErrorMessage/ErrorMessage';
import DatasetTopBar from 'components/dataset-detail-topbar/DatasetTopBar';

import { useTranslation } from 'common/i18n';
import { DetailsPane, Divider, getContainer, trackUsage } from 'utils';

import {
  DataSetWithExtpipes,
  useDataSetWithExtpipes,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useSelectedDataSet } from '../../context/index';
import TabTitle from './TabTitle';
import DatasetOverview from 'components/Overview/DatasetOverview';
import styled from 'styled-components';

const { TabPane } = Tabs;

const tabTypes = [
  'overview',
  'documentation',
  'access-control',
  'lineage',
  'data',
];

const setDefaultActiveTab = (tab: string | null) => {
  if (tab) {
    if (tabTypes.includes(tab)) {
      return tab;
    }
  }
  return 'overview';
};

const DataSetDetails = (): JSX.Element => {
  const { t } = useTranslation();
  const [editDrawerVisible, setEditDrawerVisible] = useState<boolean>(false);
  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const { dataSetId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = setDefaultActiveTab(searchParams.get('activeTab'));

  const {
    dataSetWithExtpipes,
    isExtpipesFetched,
    isLoading: loading,
    error,
  } = useDataSetWithExtpipes(Number(dataSetId));
  const dataSet = dataSetWithExtpipes?.dataSet;

  const { setSelectedDataSet } = useSelectedDataSet();

  const { flow } = getFlow();
  const { data: hasWritePermissions } = usePermissions(
    flow,
    'datasetsAcl',
    'WRITE'
  );

  const { updateDataSetVisibility, isLoading: isUpdatingDataSetVisibility } =
    useUpdateDataSetVisibility();

  const handleDatasetIdCopy = (copiedText: string | number | undefined) => {
    trackUsage({ e: 'data.sets.detail.copy.id.click', dataSetId: copiedText });
    if (copiedText) {
      copy(copiedText.toString());
      notification.success({
        message: t('copy-notification'),
      });
    }
  };

  const copyDatasetIdButton = (
    <Button
      disabled={!dataSet?.id}
      onClick={() => handleDatasetIdCopy(dataSet?.id)}
      icon="Copy"
      iconPlacement="left"
      type="tertiary"
    >
      {t('copy-id')}
    </Button>
  );

  const editButton = (
    <Button
      disabled={!hasWritePermissions}
      onClick={() => {
        trackUsage({ e: 'data.sets.detail.edit.click', dataSetId });
        setSelectedDataSet(Number(dataSetId));
        setEditDrawerVisible(true);
      }}
      icon="Edit"
      iconPlacement="left"
      type="tertiary"
    >
      {t('edit')}
    </Button>
  );

  const archiveButton = (
    <Tooltip content={t('dataset-details-archived-data-tooltip')}>
      <Button
        disabled={!hasWritePermissions}
        onClick={() => archiveDataSet()}
        loading={isUpdatingDataSetVisibility}
        icon="Archive"
        iconPlacement="left"
        type="tertiary"
      >
        {t('archive')}
      </Button>
    </Tooltip>
  );

  const restoreButton = (
    <Tooltip content={'dataset-details-archived-data-tooltip'}>
      <Button
        disabled={!hasWritePermissions}
        onClick={() => restoreDataSet()}
        loading={isUpdatingDataSetVisibility}
        icon="Restore"
        iconPlacement="left"
        type="tertiary"
      >
        {t('restore')}
      </Button>
    </Tooltip>
  );

  const discardChangesButton = (
    <div style={{ display: 'block', textAlign: 'right', marginTop: '20px' }}>
      <Button
        type="danger"
        size="small"
        onClick={() => {
          setEditDrawerVisible(false);
          setChangesSaved(true);
          notification.close('navigateAway');
        }}
      >
        {t('discard-changes')}
      </Button>
    </div>
  );

  const onEditDrawerClose = () => {
    if (changesSaved) {
      setEditDrawerVisible(false);
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

  const handleModalClose = () => {
    setEditDrawerVisible(false);
  };

  const editDrawer = (
    <DataSetEditor
      visible={editDrawerVisible}
      onClose={onEditDrawerClose}
      changesSaved={changesSaved}
      setChangesSaved={setChangesSaved}
      handleCloseModal={() => handleModalClose()}
    />
  );

  const archiveDataSet = () => {
    if (dataSet) {
      trackUsage({
        e: 'data.sets.detail.archive.click',
        dataSetId: dataSet?.id,
      });
      updateDataSetVisibility(dataSet, true);
    }
  };

  const restoreDataSet = () => {
    if (dataSet) {
      trackUsage({
        e: 'data.sets.detail.restore.click',
        dataSetId: dataSet?.id,
      });
      updateDataSetVisibility(dataSet, false);
    }
  };

  const renderLoadingError = (isLoading: boolean) => {
    if (isLoading) {
      return <Spin />;
    }
    return <ErrorMessage error={error} />;
  };

  const activeTabChangeHandler = (tabKey: string) => {
    searchParams.set('activeTab', tabKey);
    //@ts-ignore
    trackUsage({ e: `data.sets.detail.${tabKey}` });
    setSearchParams(searchParams);
  };

  if (dataSet) {
    const actions = (
      <>
        <Flex alignItems="center" gap={8}>
          {copyDatasetIdButton}
          {editButton}
          {dataSet.metadata.archived ? restoreButton : archiveButton}
        </Flex>
        {editDrawer}
      </>
    );

    return (
      <Wrapper>
        <DatasetTopBar dataset={dataSet} actions={actions} />
        <Divider />
        <DetailsPane>
          <Tabs
            animated={false}
            defaultActiveKey="overview"
            size="large"
            activeKey={activeTab}
            onChange={activeTabChangeHandler}
          >
            <TabPane
              tab={<TabTitle title={t('tab-overview')} iconType="Info" />}
              key="overview"
              style={{ height: '100%' }}
            >
              <DatasetOverview
                loading={loading}
                dataset={dataSet}
                onActiveTabChange={activeTabChangeHandler}
              />
            </TabPane>
            <TabPane
              tab={
                <TabTitle title={t('tab-explore-data')} iconType="DataSource" />
              }
              key="data"
            >
              <ExploreData loading={loading} dataSetId={Number(dataSetId)} />
            </TabPane>
            <TabPane
              tab={<TabTitle title={t('tab-lineage')} iconType="Lineage" />}
              key="lineage"
            >
              <Lineage
                dataSetWithExtpipes={dataSetWithExtpipes as DataSetWithExtpipes}
                isExtpipesFetched={isExtpipesFetched}
              />
            </TabPane>
            <TabPane
              tab={
                <TabTitle
                  title={t('tab-documentation')}
                  iconType="Documentation"
                />
              }
              key="documentation"
            >
              <DocumentationsTab dataSet={dataSet} />
            </TabPane>
            <TabPane
              tab={
                <TabTitle title={t('tab-access-control')} iconType="Users" />
              }
              key="access-control"
            >
              <AccessControl
                dataSetId={dataSet.id}
                writeProtected={dataSet.writeProtected}
              />
            </TabPane>
          </Tabs>
        </DetailsPane>
      </Wrapper>
    );
  }

  return <div>{renderLoadingError(loading)}</div>;
};

const Wrapper = styled.div`
  height: 100%;

  .ant-tabs,
  .ant-tabs-content {
    height: 100%;
  }
  .ant-tabs-nav {
    margin: 0 !important;
  }
`;

export default DataSetDetails;
