import { useState, useEffect } from 'react';
import Spin from 'antd/lib/spin';
import Tabs from 'antd/lib/tabs';
import {
  filesCounter,
  timeSeriesCounter,
  eventsCounter,
  assetsCounter,
  sequenceCounter,
  ExploreViewConfig,
  DetailsPane,
  trackUsage,
  ContentWrapper,
} from 'utils';
import { useUserInformation } from 'hooks/useUserInformation';
import { useTranslation } from 'common/i18n';
import EmptyDataState from './EmptyDataState';
import TabTitle from 'pages/DataSetDetails/TabTitle';
import AssetsTable from 'components/AssetsTable';
import EventsTable from 'components/EventsTable';
import FilesTable from 'components/FilesTable';
import SequencesTable from 'components/SequencesTable';
import TimeseriesTable from 'components/TimeseriesTable';
import EventsProfile from 'components/EventsProfile';
import { Flex, Icon } from '@cognite/cogs.js';
import { Input } from 'antd';
import useDebounce from 'hooks/useDebounce';
import { useFlag } from '@cognite/react-feature-flags';
import { TableFilter } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { useFormik } from 'formik';
import AppliedFilters from 'components/applied-filters';
import { StyledItemCount } from 'components/table-filters';
import { ResourcesFilters, useResourcesSearch } from 'hooks/useResourcesSearch';

const { TabPane } = Tabs;

interface ExploreDataProps {
  loading: boolean;
  dataSetId: number;
}

export type ExploreDataResourceTypes =
  | 'assets'
  | 'files'
  | 'events'
  | 'sequences'
  | 'timeseries';

const ExploreData = ({ loading, dataSetId }: ExploreDataProps) => {
  const { t } = useTranslation();
  const [activeResourceTabKey, setActiveResourceTabKey] = useState<
    ExploreDataResourceTypes | undefined
  >(undefined);
  const [exploreView, setExploreView] = useState<ExploreViewConfig>({
    visible: false,
  });

  const { data } = useUserInformation();
  const email = data?.email;

  const [assetCount, setAssetCount] = useState<number>(0);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [sequencesCount, setSequencesCount] = useState<number>(0);
  const [timeseriesCount, setTimeseriesCount] = useState<number>(0);
  const [filesCount, setFilesCount] = useState<number>(0);

  useEffect(() => {
    assetsCounter(dataSetId)
      .then((counter) => {
        setAssetCount(counter[0].count);
        if (counter[0].count > 0 && !activeResourceTabKey) {
          setActiveResourceTabKey('assets');
        }
      })
      .catch(() => {
        setAssetCount(-1);
      });
    eventsCounter(dataSetId)
      .then((counter) => {
        setEventsCount(counter[0].count);
        if (counter[0].count > 0 && !activeResourceTabKey) {
          setActiveResourceTabKey('events');
        }
      })
      .catch(() => {
        setEventsCount(-1);
      });
    filesCounter(dataSetId)
      .then((counter) => {
        setFilesCount(counter[0].count);
        if (counter[0].count > 0 && !activeResourceTabKey) {
          setActiveResourceTabKey('files');
        }
      })
      .catch(() => {
        setFilesCount(-1);
      });
    sequenceCounter(dataSetId)
      .then((counter) => {
        setSequencesCount(counter[0].count);
        if (counter[0].count > 0 && !activeResourceTabKey) {
          setActiveResourceTabKey('sequences');
        }
      })
      .catch(() => {
        setSequencesCount(-1);
      });
    timeSeriesCounter(dataSetId)
      .then((counter) => {
        setTimeseriesCount(counter[0].count);
        if (counter[0].count > 0 && !activeResourceTabKey) {
          setActiveResourceTabKey('timeseries');
        }
      })
      .catch(() => {
        setTimeseriesCount(-1);
      });
  }, [dataSetId, activeResourceTabKey]);

  const [query, setQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ResourcesFilters>({});
  const debouncedQuery = useDebounce(query, 100);
  const { isEnabled } = useFlag('data-catalog');

  const {
    assets: { data: assetsData, isLoading: isAssetsLoading },
    events: { data: eventsData, isLoading: isEventsLoading },
    files: { data: filesData, isLoading: isFilesLoading },
    sequences: { data: sequencesData, isLoading: isSequencesLoading },
    timeseries: { data: timeseriesData, isLoading: isTimeseriesLoading },
  } = useResourcesSearch({
    dataSetId,
    query: debouncedQuery,
    filters: appliedFilters,
  });

  const dataSetContainsData = () => {
    return !(
      assetCount === 0 &&
      sequencesCount === 0 &&
      timeseriesCount === 0 &&
      filesCount === 0 &&
      eventsCount === 0
    );
  };

  const activeResourceTabChangeHandler = (tabKey: string) => {
    setActiveResourceTabKey(tabKey as ExploreDataResourceTypes);
  };

  const renderExploreView = () => {
    if (exploreView.type && exploreView.id) {
      trackUsage(`DataSets.DataExplore.Viewed resource`, email, {
        resourceType: exploreView.type,
      });
      if (exploreView.type === 'events-profile') {
        return (
          <>
            <EventsProfile
              dataSetId={dataSetId}
              closeDrawer={() => setExploreView({ visible: false })}
              visible={exploreView.visible}
            />
          </>
        );
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      externalIdPrefix: '',
    },
    onSubmit: (values) => setAppliedFilters(values),
  });

  const onClearFilters = () => {
    setAppliedFilters({});
    formik.resetForm();
    setIsFilterVisible(false);
  };

  const onApplyFilters = () => {
    formik.handleSubmit();
    setIsFilterVisible(false);
  };

  const clearFilter = (key: keyof ResourcesFilters) => {
    formik.setFieldValue(key, '');
    const filters = { ...appliedFilters };
    delete filters[key];
    setAppliedFilters(filters);
  };

  const getSearchResultsCount = () => {
    switch (activeResourceTabKey) {
      case 'assets':
        return assetsData?.length;
      case 'events':
        return eventsData?.length;
      case 'files':
        return filesData?.length;
      case 'sequences':
        return sequencesData?.length;
      case 'timeseries':
        return timeseriesData?.length;
    }
  };

  const getTotalResultsCount = () => {
    switch (activeResourceTabKey) {
      case 'assets':
        return assetCount;
      case 'events':
        return eventsCount;
      case 'files':
        return filesCount;
      case 'sequences':
        return sequencesCount;
      case 'timeseries':
        return timeseriesCount;
    }
  };

  if (dataSetContainsData()) {
    return (
      <Spin spinning={loading}>
        <ContentWrapper>
          <DetailsPane>
            {isEnabled && (
              <Flex direction="column" gap={8}>
                <Flex
                  display="inline-flex"
                  gap={8}
                  alignItems="center"
                  style={{ marginLeft: 10 }}
                >
                  <Input
                    value={query}
                    prefix={<Icon type="Search" />}
                    placeholder={t('search')}
                    onChange={(evt) => {
                      setQuery(evt.currentTarget.value);
                    }}
                    style={{ width: 312 }}
                    allowClear
                  />
                  <TableFilter
                    onClear={onClearFilters}
                    onApply={onApplyFilters}
                    visible={isFilterVisible}
                    onVisibleChange={() => setIsFilterVisible(!isFilterVisible)}
                    menuTitle={t('filter-by')}
                  >
                    <StyledTableFilterSection>
                      <label
                        className="cogs-body-2 strong"
                        htmlFor="externalIdPrefix"
                      >
                        {t('external-id')}
                      </label>
                      <Input
                        id="externalIdPrefix"
                        name="externalIdPrefix"
                        onChange={formik.handleChange}
                        value={formik.values.externalIdPrefix}
                        placeholder={t('starts-with')}
                        allowClear
                      />
                    </StyledTableFilterSection>
                  </TableFilter>
                  <StyledItemCount level={2}>
                    {getSearchResultsCount()} of {getTotalResultsCount()}
                  </StyledItemCount>
                </Flex>
                <AppliedFilters
                  items={Object.entries(appliedFilters).map(([key, value]) => ({
                    key,
                    label: t(key as keyof ResourcesFilters, {
                      value,
                    }),
                    onClick: () => clearFilter(key as keyof ResourcesFilters),
                  }))}
                  onClear={onClearFilters}
                />
              </Flex>
            )}
            <Tabs
              animated={false}
              defaultActiveKey="assets"
              size="large"
              activeKey={activeResourceTabKey}
              onChange={activeResourceTabChangeHandler}
            >
              <TabPane
                tab={
                  <TabTitle
                    title={t('assets')}
                    iconType="Assets"
                    label={assetCount.toLocaleString()}
                    disabled={assetCount === 0}
                    isTooltip={assetCount < 0}
                    resource="assets"
                  />
                }
                key="assets"
                disabled={assetCount === 0}
              >
                <AssetsTable data={assetsData} isLoading={isAssetsLoading} />
              </TabPane>
              <TabPane
                tab={
                  <TabTitle
                    title={t('events')}
                    iconType="Events"
                    label={eventsCount.toLocaleString()}
                    disabled={eventsCount === 0}
                    isTooltip={eventsCount < 0}
                    resource="events"
                  />
                }
                key="events"
                disabled={eventsCount === 0}
              >
                <EventsTable
                  dataSetId={dataSetId}
                  setExploreView={setExploreView}
                  data={eventsData}
                  isLoading={isEventsLoading}
                />
              </TabPane>
              <TabPane
                tab={
                  <TabTitle
                    title={t('files')}
                    iconType="Document"
                    label={filesCount.toLocaleString()}
                    disabled={filesCount === 0}
                    isTooltip={filesCount < 0}
                    resource="files"
                  />
                }
                key="files"
                disabled={filesCount === 0}
              >
                <FilesTable data={filesData} isLoading={isFilesLoading} />
              </TabPane>
              <TabPane
                tab={
                  <TabTitle
                    title={t('sequence_other')}
                    iconType="Sequences"
                    label={sequencesCount.toLocaleString()}
                    disabled={sequencesCount === 0}
                    isTooltip={sequencesCount < 0}
                    resource="sequences"
                  />
                }
                key="sequences"
                disabled={sequencesCount === 0}
              >
                <SequencesTable
                  data={sequencesData}
                  isLoading={isSequencesLoading}
                />
              </TabPane>
              <TabPane
                tab={
                  <TabTitle
                    title={t('time-series')}
                    iconType="Timeseries"
                    label={timeseriesCount.toLocaleString()}
                    disabled={timeseriesCount === 0}
                    isTooltip={timeseriesCount < 0}
                    resource="timeseries"
                  />
                }
                key="timeseries"
                disabled={timeseriesCount === 0}
              >
                <TimeseriesTable
                  data={timeseriesData}
                  isLoading={isTimeseriesLoading}
                />
              </TabPane>
            </Tabs>
            {exploreView.visible && renderExploreView()}
          </DetailsPane>
        </ContentWrapper>
      </Spin>
    );
  }

  return <EmptyDataState />;
};

export default ExploreData;

const StyledTableFilterSection = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  padding: 16px;
`;
