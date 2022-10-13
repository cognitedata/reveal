import { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';

import { notification } from 'antd';
import Spin from 'antd/lib/spin';
import Card from 'antd/lib/card';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Tabs from 'antd/lib/tabs';
import { Button, Tooltip, Colors, Title, Flex } from '@cognite/cogs.js';

import DataSetEditor from 'pages/DataSetEditor';
import ExploreData from 'components/ExploreData';
import Lineage from 'components/Lineage';
import DocumentationsTab from 'components/DocumentationsTab';
import AccessControl from 'components/AccessControl';
import BasicInfoCard from 'components/BasicInfoCard';
import { ErrorMessage } from 'components/ErrorMessage/ErrorMessage';
import DatasetTopBar from 'components/dataset-detail-topbar/DatasetTopBar';

import { useTranslation } from 'common/i18n';
import { ContentView, DetailsPane, getContainer } from 'utils';

import {
  DataSetWithExtpipes,
  useDataSetWithExtpipes,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useSelectedDataSet } from '../../context/index';
import TabTitle from './TabTitle';

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
        <StyledDivider />
        <DetailsPane>
          <Tabs animated={false} defaultActiveKey="1" size="large">
            <TabPane
              tab={<TabTitle title={t('tab-overview')} iconType="Info" />}
              key="1"
            >
              <Row style={{ padding: 12 }}>
                <Col span={15}>
                  <Row>
                    <Col span={24}>
                      <StyledCard>
                        <StyledCardTitle level={5}>
                          {t('description')}
                        </StyledCardTitle>
                        <StyledDivider />
                        <ContentView>{dataSet.description}</ContentView>
                      </StyledCard>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <StyledCard>
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                          style={{ padding: '8px 24px' }}
                        >
                          <Title level={5}>{t('tab-overview')}</Title>
                          <Button
                            type="link"
                            onClick={() => {
                              //TODO
                            }}
                          >
                            {t('view')}
                          </Button>
                        </Flex>
                        <StyledDivider />
                        {/* <>TODO: Overview content</> */}
                      </StyledCard>
                    </Col>
                    <Col span={12}>
                      <StyledCard>
                        <StyledCardTitle level={5}>
                          {t('tab-access-control')}
                        </StyledCardTitle>
                        <StyledDivider />
                        {/* <>TODO: Access control content</> */}
                      </StyledCard>
                    </Col>
                  </Row>
                </Col>
                <Col span={7}>
                  <StyledCard>
                    <StyledCardTitle level={5}>{t('summary')}</StyledCardTitle>
                    <StyledDivider />
                    <BasicInfoCard dataSet={dataSet} />
                  </StyledCard>
                </Col>
              </Row>
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

const StyledDivider = styled.div`
  background-color: ${Colors['bg-control--disabled']};
  height: 1px;
  width: 100%;
`;

const StyledCard = styled(Card)`
  margin: 12px;
  min-height: 300px;
`;

const StyledCardTitle = styled(Title)`
  padding: 16px 24px;
`;

export default DataSetDetails;
