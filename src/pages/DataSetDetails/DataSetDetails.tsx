import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getContainer } from 'utils/shared';

import NewHeader from 'components/NewHeader';
import Spin from 'antd/lib/spin';
import Card from 'antd/lib/card';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import { Button, Tooltip } from '@cognite/cogs.js';
import theme from 'styles/theme';
import Tabs from 'antd/lib/tabs';
import ExploreData from 'components/ExploreData';
import Lineage from 'components/Lineage';
import DocumentationsTab from 'components/DocumentationsTab';
import AccessControl from 'components/AccessControl';
import { SeperatorLine, DetailsPane } from 'utils/styledComponents';
import DataSetEditor from 'pages/DataSetEditor';
import { notification } from 'antd';
import BasicInfoCard from 'components/BasicInfoCard';
import { ErrorMessage } from 'components/ErrorMessage/ErrorMessage';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import {
  DataSetWithExtpipes,
  useDataSetWithExtpipes,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useSelectedDataSet } from '../../context/index';
import { useTranslation } from 'common/i18n';

const { TabPane } = Tabs;

const DataSetDetails = (): JSX.Element => {
  const { t } = useTranslation();
  const [editDrawerVisible, setEditDrawerVisible] = useState<boolean>(false);
  const [changesSaved, setChangesSaved] = useState<boolean>(true);

  const { appPath } = useParams<{ appPath: string }>();

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
      <div>
        {editButton}
        {editDrawer}
        {dataSet.metadata.archived ? restoreButton : archiveButton}
      </div>
    );

    return (
      <div>
        <NewHeader
          title={dataSet.name}
          ornamentColor={theme.specificTitleOrnamentColor}
          breadcrumbs={[
            { title: t('data-set_other'), path: `/${appPath}` },
            { title: dataSet.name },
          ]}
          help="https://docs.cognite.com/cdf/data_governance/concepts/datasets"
          rightItem={actions}
        />
        <div style={{ alignItems: 'center', display: 'flex' }} />
        <Card loading={loading && !dataSet}>
          <Row>
            <Col md={6} xs={24}>
              <BasicInfoCard dataSet={dataSet} />
            </Col>
            <Col md={1} xs={0}>
              <SeperatorLine />
            </Col>
            <Col md={17} xs={24}>
              <DetailsPane>
                <Tabs animated={false} defaultActiveKey="1" size="large">
                  <TabPane
                    tab={t('tab-explore-data').toLocaleUpperCase()}
                    key="1"
                  >
                    <ExploreData
                      loading={loading}
                      dataSetId={Number(dataSetId)}
                    />
                  </TabPane>
                  <TabPane tab={t('tab-lineage').toLocaleUpperCase()} key="2">
                    <Lineage
                      dataSetWithExtpipes={
                        dataSetWithExtpipes as DataSetWithExtpipes
                      }
                      isExtpipesFetched={isExtpipesFetched}
                    />
                  </TabPane>
                  <TabPane
                    tab={t('tab-documentation').toLocaleUpperCase()}
                    key="3"
                  >
                    <DocumentationsTab dataSet={dataSet} />
                  </TabPane>
                  <TabPane
                    tab={t('tab-access-control').toLocaleUpperCase()}
                    key="4"
                  >
                    <AccessControl
                      dataSetId={dataSet.id}
                      writeProtected={dataSet.writeProtected}
                    />
                  </TabPane>
                </Tabs>
              </DetailsPane>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <NewHeader
        title={t('data-set-details')}
        ornamentColor={theme.specificTitleOrnamentColor}
        breadcrumbs={[
          { title: t('data-set_other'), path: `/${appPath}` },
          { title: t('data-set-details') },
        ]}
      />
      {renderLoadingError(loading)}
    </div>
  );
};

export default DataSetDetails;
