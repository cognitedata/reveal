/* eslint-disable no-nested-ternary */
import { useState } from 'react';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Title, Flex, Body, Button, Icon, Textarea } from '@cognite/cogs.js';

import { useUpdateDataSetMutation } from '../../actions';
import { EmptyDataset, Users as UsersIcon } from '../../assets';
import { useTranslation } from '../../common/i18n';
import { useResourceAggregates } from '../../hooks/useResourceAggregates';
import {
  Card,
  Col,
  ContentView,
  ContentWrapper,
  DataSet,
  Divider,
  EXPLORE_DATA_CATALOG,
  isEmptyDataset,
  Row,
  trackUsage,
} from '../../utils';
import BasicInfoCard from '../BasicInfoCard';

type DatasetOverviewProps = {
  dataSet: DataSet;
  loading?: boolean | undefined;
  onActiveTabChange: (tabKey: string) => void;
};
const DatasetOverview = ({
  dataSet,
  onActiveTabChange,
}: DatasetOverviewProps): JSX.Element => {
  const { t } = useTranslation();
  const [isEditEnabled, setEdit] = useState(false);
  const { isLoading: isUpdating, mutateAsync: updateDataSet } =
    useUpdateDataSetMutation();
  const [description, setDescription] = useState(dataSet?.description || '');
  const { id } = dataSet || {};
  const [
    { data: assets, isLoading: isAssetsLoading },
    { data: timeseries, isLoading: isTimeseriesLoading },
    { data: files, isLoading: isFilesLoading },
    { data: events, isLoading: isEventsLoading },
    { data: sequences, isLoading: isSequencesLoading },
  ] = useResourceAggregates(id);

  type Resource = keyof typeof resourceAggregates;

  const resourceAggregates = {
    assets: {
      name: t('assets'),
      isLoading: isAssetsLoading,
      value: isAssetsLoading ? -1 : assets?.[0]?.count || 0,
      icon: <Icon type="Assets" />,
    },
    events: {
      name: t('events'),
      isLoading: isEventsLoading,
      value: isEventsLoading ? -1 : events?.[0]?.count || 0,
      icon: <Icon type="Events" />,
    },
    files: {
      name: t('files'),
      isLoading: isFilesLoading,
      value: isFilesLoading ? -1 : files?.[0]?.count || 0,
      icon: <Icon type="Document" />,
    },
    sequences: {
      name: t('sequence_other'),
      isLoading: isSequencesLoading,
      value: isSequencesLoading ? -1 : sequences?.[0]?.count || 0,
      icon: <Icon type="Sequences" />,
    },
    timeseries: {
      name: t('time-series'),
      isLoading: isTimeseriesLoading,
      value: isTimeseriesLoading ? -1 : timeseries?.[0]?.count || 0,
      icon: <Icon type="Timeseries" />,
    },
  } as const;

  const handleManageAccess = () => {
    trackUsage({ e: 'data.sets.detail.manage.access.click', dataSetId: id });
    window.open(createLink(`/access-management`), '_blank');
  };

  const getResourceBarWidth = (resourceCount: number) => {
    if (resourceCount > 0) {
      const resourceWithMaxCount = Object.keys(resourceAggregates).reduce(
        (res1, res2) => {
          return resourceAggregates[res1 as Resource].value >
            resourceAggregates[res2 as Resource].value
            ? res1
            : res2;
        }
      );
      const resourceMaxCount =
        resourceAggregates[resourceWithMaxCount as Resource].value;

      return (resourceCount / resourceMaxCount) * 100;
    }
    return 100;
  };

  const handleEdit = () => {
    updateDataSet({
      ...dataSet,
      description,
    }).then(() => {
      setEdit(false);
    });
  };

  const isDatasetResourceLoading = () => {
    return (
      isAssetsLoading ||
      isEventsLoading ||
      isFilesLoading ||
      isSequencesLoading ||
      isTimeseriesLoading
    );
  };

  return (
    <ContentWrapper $backgroundColor="#FAFAFA">
      <Row>
        <Col span={15} style={{ minWidth: 940 }}>
          <Row>
            <Col span={24}>
              <StyledCard className="margin-right-bottom">
                <StyledActionTitle
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Title level={5}>{t('description')}</Title>
                  <Button
                    type="ghost-accent"
                    onClick={() => {
                      setEdit(!isEditEnabled);
                    }}
                  >
                    {t('edit')}
                  </Button>
                </StyledActionTitle>
                <Divider />
                <ContentView>
                  {isEditEnabled ? (
                    <Flex
                      direction="column"
                      justifyContent="space-between"
                      alignItems="stretch"
                    >
                      <Textarea
                        appearance="outline"
                        style={{ minHeight: 100 }}
                        fullWidth
                        placeholder={t('add-description')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <Flex
                        gap={8}
                        style={{ alignSelf: 'flex-end', paddingTop: 16 }}
                      >
                        <Button
                          icon="Checkmark"
                          type="primary"
                          onClick={handleEdit}
                        >
                          {isUpdating ? <Icon type="Loader" /> : t('save')}
                        </Button>
                        <Button
                          icon="Close"
                          type="secondary"
                          onClick={() => {
                            setEdit(false);
                            setDescription(dataSet?.description || '');
                          }}
                        >
                          {t('cancel')}
                        </Button>
                      </Flex>
                    </Flex>
                  ) : (
                    dataSet?.description
                  )}
                </ContentView>
              </StyledCard>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <StyledCard className="margin-right-bottom">
                <StyledActionTitle
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Title level={5}>{t('tab-overview')}</Title>
                  <Button
                    type="ghost-accent"
                    onClick={() => onActiveTabChange('data')}
                  >
                    {t('view')}
                  </Button>
                </StyledActionTitle>
                <Divider />
                <Row css={{ padding: 12 }}>
                  <Col span={24}>
                    {isDatasetResourceLoading() ? (
                      <Icon type="Loader" />
                    ) : isEmptyDataset(
                        resourceAggregates.assets.value,
                        resourceAggregates.events.value,
                        resourceAggregates.files.value,
                        resourceAggregates.sequences.value,
                        resourceAggregates.timeseries.value
                      ) ? (
                      <Flex
                        alignItems="center"
                        direction="column"
                        style={{ margin: '52px auto' }}
                      >
                        <EmptyDataset />
                        <Title level={4}>{t('dataset-is-empty')}</Title>
                        <Body
                          level={2}
                          strong
                          className="mute"
                          style={{ padding: '2px 0 24px 0' }}
                        >
                          {t('learn-how-to')}{' '}
                          <a
                            href={EXPLORE_DATA_CATALOG}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('add-data', { postProcess: 'lowercase' })}
                          </a>
                        </Body>
                      </Flex>
                    ) : (
                      Object.keys(resourceAggregates).map((resource) => {
                        const resourceAggr =
                          resourceAggregates[
                            resource as keyof typeof resourceAggregates
                          ];
                        return (
                          <Row css={{ padding: 12 }} key={resource}>
                            <Col span={7}>
                              <Flex
                                direction="row"
                                alignItems="center"
                                gap={10}
                              >
                                {resourceAggr.icon}
                                <Body level={1} strong className="aggr-title">
                                  {resourceAggr.name}
                                </Body>
                              </Flex>
                            </Col>
                            <Col span={12}>
                              {resourceAggr.isLoading ? (
                                <Icon type="Loader" />
                              ) : (
                                <StyledProgressBar
                                  key={`${resourceAggr.name}_resource_count`}
                                  $width={getResourceBarWidth(
                                    resourceAggr.value
                                  )}
                                  style={{
                                    background:
                                      resourceAggr.value === 0
                                        ? '#f5f5f5 !important'
                                        : '#8C8C8C',
                                  }}
                                />
                              )}
                            </Col>
                            <Col span={5}>
                              <Flex
                                alignItems="center"
                                justifyContent="flex-end"
                              >
                                <Body level={1}>
                                  {resourceAggr.value.toLocaleString()}
                                </Body>
                              </Flex>
                            </Col>
                          </Row>
                        );
                      })
                    )}
                  </Col>
                </Row>
              </StyledCard>
            </Col>
            <Col span={12}>
              <StyledCard className="margin-right-bottom">
                <StyledTitle level={5}>{t('tab-access-control')}</StyledTitle>
                <Divider />
                <Flex
                  alignItems="center"
                  direction="column"
                  style={{ margin: '46px auto' }}
                >
                  <UsersIcon />
                  <Title level={4}>{t('who-has-access')}</Title>
                  <Body
                    level={2}
                    strong
                    className="mute"
                    style={{ padding: '2px 0 24px 0' }}
                  >
                    {t('view-and-manage-user-permission')}
                  </Body>
                  <Button type="secondary" onClick={handleManageAccess}>
                    {t('manage')}
                  </Button>
                </Flex>
              </StyledCard>
            </Col>
          </Row>
        </Col>
        <Col span={9}>
          <StyledCard>
            <StyledTitle level={5}>{t('summary')}</StyledTitle>
            <Divider />
            <BasicInfoCard dataSet={dataSet} />
          </StyledCard>
        </Col>
      </Row>
    </ContentWrapper>
  );
};

const StyledProgressBar = styled.div<{
  $width?: number | string;
}>`
  width: ${({ $width }) => $width}%;
  height: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-image: repeating-linear-gradient(
    79deg,
    #e8e8e8 8px,
    #e8e8e8 10px,
    #f5f5f5 2px,
    #f5f5f5 12px
  );
`;

const StyledCard = styled(Card)`
  height: auto;
  min-width: 450px;

  .ant-card-body {
    padding: 0;
  }

  .aggr-title {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.7);
  }

  .mute {
    color: rgba(0, 0, 0, 0.55);
  }
`;

const StyledTitle = styled(Title)`
  padding: 16px 24px !important;
`;

const StyledActionTitle = styled(Flex)`
  padding: 8px 24px;
`;

export default DatasetOverview;
