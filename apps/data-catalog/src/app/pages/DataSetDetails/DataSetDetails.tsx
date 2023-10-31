import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';

import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import {
  Flex,
  Icon,
  Chip,
  Title,
  Tooltip,
  Menu,
  Tabs,
  toast,
} from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  DataSetWithExtpipes,
  useDataSetWithExtpipes,
  useUpdateDataSetVisibility,
} from '../../actions';
import { useTranslation } from '../../common/i18n';
import AccessControl from '../../components/AccessControl';
import ExploreData from '../../components/Data/ExploreData';
import DocumentationsTab from '../../components/DocumentationsTab';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import Lineage from '../../components/Lineage';
import DatasetOverview from '../../components/Overview/DatasetOverview';
import { useSelectedDataSet } from '../../context';
import useDiscardChangesToast from '../../hooks/useDiscardChangesToast';
import {
  DetailsPane,
  Divider,
  getGovernedStatus,
  trackUsage,
  DATASET_HELP_DOC,
  LoaderWrapper,
} from '../../utils';
import DataSetEditor from '../DataSetEditor';

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
  const { subAppPath: appPath } = useParams<{ subAppPath?: string }>();
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

  const { data: hasWritePermissions } = usePermissions('datasetsAcl', 'WRITE');

  // TODO: add this once we have new Menu
  const { updateDataSetVisibility, isLoading: _isUpdatingDataSetVisibility } =
    useUpdateDataSetVisibility();

  const handleDatasetIdCopy = (copiedText: string | number | undefined) => {
    trackUsage({ e: 'data.sets.detail.copy.id.click', dataSetId: copiedText });
    if (copiedText) {
      copy(copiedText.toString());
      toast.success(t('copy-notification'));
    }
  };

  const onDiscardClick = () => {
    setEditDrawerVisible(false);
    setChangesSaved(true);
    setSelectedDataSet(undefined);
  };

  const openDiscardChangesToast = useDiscardChangesToast({ onDiscardClick });

  const onEditDrawerClose = () => {
    if (changesSaved) {
      setEditDrawerVisible(false);
      setSelectedDataSet(undefined);
    } else {
      openDiscardChangesToast();
    }
  };

  const handleModalClose = () => {
    setEditDrawerVisible(false);
    setSelectedDataSet(undefined);
  };

  const { consoleLabels } = dataSet?.metadata || {
    consoleLabels: [],
  };

  const { statusVariant, statusI18nKey } = getGovernedStatus(
    // eslint-disable-next-line
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
      return (
        <LoaderWrapper>
          <Icon size={32} type="Loader" />
        </LoaderWrapper>
      );
    }
    return <ErrorMessage error={error} />;
  };

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
    // eslint-disable-next-line
    // @ts-ignore
    trackUsage({ e: `data.sets.detail.${tabKey}` });
    setSearchParams(searchParams, { replace: true });
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
          return <ExploreData dataSetId={Number(dataSetId)} />;
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
              dataSetId={dataSet?.id}
              writeProtected={dataSet?.writeProtected}
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          title={
            <Flex alignItems="center" gap={8}>
              {dataSet?.writeProtected ? <Icon type="Lock" /> : <></>}
              <Title level="4" data-cy="data-set-title">
                {dataSet?.name || dataSet?.externalId}
              </Title>
              <Chip
                size="medium"
                type={statusVariant}
                label={t(statusI18nKey)}
              />
              {consoleLabels?.length ? (
                <Flex gap={4} alignItems="center" direction="row">
                  <Chip
                    size="medium"
                    type="default"
                    label={consoleLabels?.[0]}
                  />
                  {consoleLabels?.length > 1 && (
                    <Chip
                      size="medium"
                      type="default"
                      label={`+${consoleLabels?.length - 1}`}
                    />
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
                defaultActiveKey="overview"
                size="large"
                activeKey={activeTab}
                onTabClick={activeTabChangeHandler}
              >
                <Tabs.Tab
                  tabKey="overview"
                  label={t('tab-overview')}
                  iconLeft="Info"
                />
                <Tabs.Tab
                  tabKey="data"
                  label={t('tab-explore-data')}
                  iconLeft="DataSource"
                />
                <Tabs.Tab
                  tabKey="lineage"
                  label={t('tab-lineage')}
                  iconLeft="Lineage"
                />
                <Tabs.Tab
                  tabKey="documentation"
                  label={t('tab-documentation')}
                  iconLeft="Documentation"
                />
                <Tabs.Tab
                  tabKey="access-control"
                  label={t('tab-access-control')}
                  iconLeft="Users"
                />
              </Tabs>
            </DetailsPane>
          }
          optionsDropdownProps={{
            content: (
              <Menu>
                <Menu.Item
                  iconPlacement="left"
                  icon="Copy"
                  aria-label="Copy"
                  disabled={!dataSet?.id}
                  onClick={() => handleDatasetIdCopy(dataSet?.id)}
                >
                  {t('copy-id')}
                </Menu.Item>
                <Menu.Item
                  iconPlacement="left"
                  icon="Edit"
                  disabled={!hasWritePermissions}
                  onClick={() => {
                    trackUsage({ e: 'data.sets.detail.edit.click', dataSetId });
                    setSelectedDataSet(Number(dataSetId));
                    setEditDrawerVisible(true);
                  }}
                >
                  {t('edit')}
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
                      iconPlacement="left"
                      icon="Restore"
                      disabled={!hasWritePermissions}
                      onClick={() => restoreDataSet()}
                      // TODO: add this when we upgrade Cogs version
                      // loading={isUpdatingDataSetVisibility}
                    >
                      {t('restore')}
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      iconPlacement="left"
                      icon="Archive"
                      disabled={!hasWritePermissions}
                      onClick={() => archiveDataSet()}
                      // TODO: add this when we upgrade Cogs version
                      // loading={isUpdatingDataSetVisibility}
                    >
                      {t('archive')}
                    </Menu.Item>
                  )}
                </Tooltip>
                <Menu.Divider />
                <Menu.Item
                  iconPlacement="left"
                  icon="Documentation"
                  onClick={() => {
                    trackUsage({
                      e: 'data.sets.detail.help.documentation.click',
                      document: DATASET_HELP_DOC,
                    });
                    window.open(DATASET_HELP_DOC, '_blank');
                  }}
                >
                  {t('docs')}
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
