import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';

import copy from 'copy-to-clipboard';

import { notification } from 'antd';
import Spin from 'antd/lib/spin';

import Tabs from 'antd/lib/tabs';
import {
  Button,
  Flex,
  Icon,
  Label,
  Title,
  Tooltip,
  Menu,
} from '@cognite/cogs.js';

import DataSetEditor from 'pages/DataSetEditor';
import ExploreData from 'components/Data/ExploreData';
import Lineage from 'components/Lineage';
import DocumentationsTab from 'components/DocumentationsTab';
import AccessControl from 'components/AccessControl';

import { ErrorMessage } from 'components/ErrorMessage/ErrorMessage';

import { useTranslation } from 'common/i18n';
import {
  DetailsPane,
  Divider,
  getContainer,
  getGovernedStatus,
  trackUsage,
  DATASET_HELP_DOC,
} from 'utils';

import {
  DataSetWithExtpipes,
  useDataSetWithExtpipes,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useSelectedDataSet } from '../../context/index';
import TabTitle from './TabTitle';
import DatasetOverview from 'components/Overview/DatasetOverview';
import styled from 'styled-components';
import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import { useFlag } from '@cognite/react-feature-flags';

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
  const navigate = useNavigate();
  const { appPath } = useParams<{ appPath?: string }>();
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

  // TODO: add this once we have new Menu
  const { updateDataSetVisibility, isLoading: _isUpdatingDataSetVisibility } =
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

  const { consoleLabels } = dataSet?.metadata || {
    consoleLabels: [],
  };

  const { statusVariant, statusI18nKey } = getGovernedStatus(
    dataSet?.metadata?.consoleGoverned!
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

  // TODO: add this when we add onClick to SecondaryTopbar button
  const _handleGoToDatasets = () => {
    trackUsage({ e: 'data.sets.detail.navigate.back.click' });
    navigate(createLink(`/${appPath}`));
  };

  const renderLoadingError = (isLoading: boolean) => {
    if (isLoading) {
      return <Spin />;
    }
    return <ErrorMessage error={error} />;
  };

  // const { isEnabled } = useFlag('DATA_EXPLORATION_filters');

  const [selectedTab, setSelectedTab] = useState(
    searchParams.get('activeTab') || 'overview'
  );
  const activeTabChangeHandler = (tabKey: string) => {
    // Navigate the user to the new data exploration UI if it's feature toggled.
    // After discussions, we decided not to have the link to data exploration from
    // here, instead we want to keep the tables in view, will comment out this code
    // for future references in order to be able to reproduce this if we ever want to
    // link to data exploration.
    // if (tabKey === 'data' && isEnabled) {
    //   const url = createLink(`/explore/search`, {
    //     filter: JSON.stringify({
    //       filters: {
    //         common: {
    //           dataSetIds: [
    //             {
    //               value: dataSet?.id,
    //               label:
    //                 dataSet?.name ||
    //                 dataSet?.externalId ||
    //                 dataSet?.description,
    //             },
    //           ],
    //         },
    //       },
    //     }),
    //   });
    //   window.open(url, '_blank', 'noopener noreferrer');
    // } else {
    searchParams.set('activeTab', tabKey);
    // @ts-ignore
    trackUsage({ e: `data.sets.detail.${tabKey}` });
    setSearchParams(searchParams);
    setSelectedTab(tabKey);
    // }
  };

  const renderTab = () => {
    if (dataSet) {
      switch (selectedTab) {
        case 'overview': {
          return (
            <DatasetOverview
              loading={loading}
              dataSet={dataSet}
              onActiveTabChange={activeTabChangeHandler}
            />
          );
        }
        case 'data': {
          return (
            <ExploreData loading={loading} dataSetId={Number(dataSetId)} />
          );
        }
        case 'lineage': {
          return (
            <Lineage
              dataSetWithExtpipes={dataSetWithExtpipes as DataSetWithExtpipes}
              isExtpipesFetched={isExtpipesFetched}
            />
          );
        }
        case 'documentation': {
          return <DocumentationsTab dataSet={dataSet} />;
        }
        case 'access-control': {
          return (
            <AccessControl
              dataSetId={dataSet?.id!}
              writeProtected={dataSet?.writeProtected!}
            />
          );
        }
      }
    }
  };

  if (dataSet) {
    return (
      <Wrapper>
        <DataSetEditor
          visible={editDrawerVisible}
          onClose={onEditDrawerClose}
          changesSaved={changesSaved}
          setChangesSaved={setChangesSaved}
          handleCloseModal={() => handleModalClose()}
        />
        <SecondaryTopbar
          // TODO: change this to support a callback function
          // goBackFallback={() => handleGoToDatasets}
          // TODO: make this prop support ReactNode
          // @ts-ignore
          title={
            <Flex alignItems="center" gap={8}>
              {dataSet?.writeProtected ? <Icon type="Lock" /> : <></>}
              <Title level="4">{dataSet?.name || dataSet?.externalId}</Title>
              <Label size="medium" variant={statusVariant}>
                {t(statusI18nKey)}
              </Label>
              {consoleLabels?.length ? (
                <Flex gap={4} alignItems="center" direction="row">
                  <Label size="medium" variant="default">
                    {consoleLabels?.[0]}
                  </Label>
                  {consoleLabels?.length > 1 && (
                    <Label size="medium" variant="default">
                      {`+${consoleLabels?.length - 1}`}
                    </Label>
                  )}
                </Flex>
              ) : (
                <></>
              )}
            </Flex>
          }
          extraContent={
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
                />
                <TabPane
                  tab={
                    <TabTitle
                      title={t('tab-explore-data')}
                      iconType="DataSource"
                    />
                  }
                  key="data"
                />
                <TabPane
                  tab={<TabTitle title={t('tab-lineage')} iconType="Lineage" />}
                  key="lineage"
                />
                <TabPane
                  tab={
                    <TabTitle
                      title={t('tab-documentation')}
                      iconType="Documentation"
                    />
                  }
                  key="documentation"
                />
                <TabPane
                  tab={
                    <TabTitle
                      title={t('tab-access-control')}
                      iconType="Users"
                    />
                  }
                  key="access-control"
                />
              </Tabs>
            </DetailsPane>
          }
          dropdownProps={{
            content: (
              <Menu>
                <Menu.Item
                  disabled={!dataSet?.id}
                  onClick={() => handleDatasetIdCopy(dataSet?.id)}
                >
                  <Flex
                    gap={4}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Icon type="Copy" />
                    {t('copy-id')}
                  </Flex>
                </Menu.Item>
                <Menu.Item
                  disabled={!hasWritePermissions}
                  onClick={() => {
                    trackUsage({ e: 'data.sets.detail.edit.click', dataSetId });
                    setSelectedDataSet(Number(dataSetId));
                    setEditDrawerVisible(true);
                  }}
                >
                  <Flex
                    gap={4}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Icon type="Edit" />
                    {t('edit')}
                  </Flex>
                </Menu.Item>
                <Tooltip
                  content={t(
                    dataSet?.metadata?.archived
                      ? 'dataset-details-archived-data-tooltip'
                      : 'dataset-details-archived-data-tooltip'
                  )}
                >
                  {dataSet.metadata.archived ? (
                    <Menu.Item
                      disabled={!hasWritePermissions}
                      onClick={() => restoreDataSet()}
                      // TODO: add this when we upgrade Cogs version
                      // loading={isUpdatingDataSetVisibility}
                    >
                      <Flex
                        gap={4}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Icon type="Restore" />
                        {t('restore')}
                      </Flex>
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      disabled={!hasWritePermissions}
                      onClick={() => archiveDataSet()}
                      // TODO: add this when we upgrade Cogs version
                      // loading={isUpdatingDataSetVisibility}
                    >
                      <Flex
                        gap={4}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Icon type="Archive" />
                        {t('archive')}
                      </Flex>
                    </Menu.Item>
                  )}
                </Tooltip>
                <Menu.Divider />
                <Menu.Item
                  href={DATASET_HELP_DOC}
                  target="_blank"
                  onClick={() =>
                    trackUsage({
                      e: 'data.sets.detail.help.documentation.click',
                      document: DATASET_HELP_DOC,
                    })
                  }
                >
                  <Flex
                    gap={4}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Icon type="Documentation" />
                    {t('cognite-docs')}
                  </Flex>
                </Menu.Item>
              </Menu>
            ),
          }}
        />
        <Divider />
        {renderTab()}
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
