import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';

import { notification } from 'antd';
import Spin from 'antd/lib/spin';

import Tabs from 'antd/lib/tabs';
import { Button, Tooltip } from '@cognite/cogs.js';

import DataSetEditor from 'pages/DataSetEditor';
import ExploreData from 'components/ExploreData';
import Lineage from 'components/Lineage';
import DocumentationsTab from 'components/DocumentationsTab';
import AccessControl from 'components/AccessControl';

import { ErrorMessage } from 'components/ErrorMessage/ErrorMessage';
import DatasetTopBar from 'components/dataset-detail-topbar/DatasetTopBar';

import { useTranslation } from 'common/i18n';
import { DetailsPane, Divider, getContainer } from 'utils';

import {
  DataSetWithExtpipes,
  useDataSetWithExtpipes,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useSelectedDataSet } from '../../context/index';
import TabTitle from './TabTitle';
import DatasetOverview from 'components/Overview/DatasetOverview';

const { TabPane } = Tabs;

const DataSetDetails = (): JSX.Element => {
  const { t } = useTranslation();
  const [editDrawerVisible, setEditDrawerVisible] = useState<boolean>(false);
  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const { dataSetId } = useParams();

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

  const archiveButton = (
    <Tooltip content={t('dataset-details-archived-data-tooltip')}>
      <Button
        disabled={!hasWritePermissions}
        onClick={() => archiveDataSet()}
        style={{
          marginLeft: '10px',
        }}
        loading={isUpdatingDataSetVisibility}
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
        style={{
          marginLeft: '10px',
        }}
        loading={isUpdatingDataSetVisibility}
      >
        {t('restore')}
      </Button>
    </Tooltip>
  );

  const editButton = (
    <Button
      disabled={!hasWritePermissions}
      onClick={() => {
        setSelectedDataSet(Number(dataSetId));
        setEditDrawerVisible(true);
      }}
      style={{
        marginLeft: '10px',
      }}
    >
      {t('edit')}
    </Button>
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
      updateDataSetVisibility(dataSet, true);
    }
  };

  const restoreDataSet = () => {
    if (dataSet) {
      updateDataSetVisibility(dataSet, false);
    }
  };

  const renderLoadingError = (isLoading: boolean) => {
    if (isLoading) {
      return <Spin />;
    }
    return <ErrorMessage error={error} />;
  };

  if (dataSet) {
    const actions = (
      <>
        {editButton}
        {editDrawer}
        {dataSet.metadata.archived ? restoreButton : archiveButton}
      </>
    );

    return (
      <div>
        <DatasetTopBar dataset={dataSet} actions={actions} />
        <Divider />
        <DetailsPane>
          <Tabs animated={false} defaultActiveKey="1" size="large">
            <TabPane
              tab={<TabTitle title={t('tab-overview')} iconType="Info" />}
              key="1"
            >
              <DatasetOverview loading={loading} dataset={dataSet} />
            </TabPane>
            <TabPane
              tab={
                <TabTitle title={t('tab-explore-data')} iconType="DataSource" />
              }
              key="2"
            >
              <ExploreData loading={loading} dataSetId={Number(dataSetId)} />
            </TabPane>
            <TabPane
              tab={<TabTitle title={t('tab-lineage')} iconType="Lineage" />}
              key="3"
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
              key="4"
            >
              <DocumentationsTab dataSet={dataSet} />
            </TabPane>
            <TabPane
              tab={<TabTitle title={t('tab-access-control')} iconType="Lock" />}
              key="5"
            >
              <AccessControl
                dataSetId={dataSet.id}
                writeProtected={dataSet.writeProtected}
              />
            </TabPane>
          </Tabs>
        </DetailsPane>
      </div>
    );
  }

  return (
    <div>
      <DatasetTopBar dataset={dataSet} />
      {renderLoadingError(loading)}
    </div>
  );
};

export default DataSetDetails;
