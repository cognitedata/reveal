import { useState, useEffect } from 'react';

import styled from 'styled-components';

import { useFormik } from 'formik';

import { TableFilter } from '@cognite/cdf-utilities';
import { Flex, Tabs, Input } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';
import useDebounce from '../../hooks/useDebounce';
import {
  ResourcesFilters,
  useResourcesSearch,
} from '../../hooks/useResourcesSearch';
import {
  assetsCounter,
  ContentWrapper,
  DetailsPane,
  eventsCounter,
  ExploreViewConfig,
  filesCounter,
  isEmptyDataset,
  sequenceCounter,
  timeSeriesCounter,
  trackUsage,
} from '../../utils';
import AppliedFilters from '../applied-filters';
import AssetsTable from '../AssetsTable';
import EventsProfile from '../EventsProfile';
import EventsTable from '../EventsTable';
import FilesTable from '../FilesTable';
import SequencesTable from '../SequencesTable';
import { StyledItemCount } from '../table-filters';
import TimeseriesTable from '../TimeseriesTable';

import EmptyDataState from './EmptyDataState';

interface ExploreDataProps {
  dataSetId: number;
}

export type ExploreDataResourceTypes =
  | 'assets'
  | 'files'
  | 'events'
  | 'sequences'
  | 'timeseries';

const ExploreData = ({ dataSetId }: ExploreDataProps) => {
  const { t } = useTranslation();
  const [activeResourceTabKey, setActiveResourceTabKey] = useState<
    ExploreDataResourceTypes | undefined
  >(undefined);
  const [exploreView, setExploreView] = useState<ExploreViewConfig>({
    visible: false,
  });

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

  const activeResourceTabChangeHandler = (tabKey: string) => {
    // eslint-disable-next-line
    //@ts-ignore
    trackUsage({ e: `data.sets.detail.resources.${tabKey}` });
    setActiveResourceTabKey(tabKey as ExploreDataResourceTypes);
  };

  const renderExploreView = () => {
    if (
      exploreView.type &&
      exploreView.id &&
      exploreView.type === 'events-profile'
    )
      return (
        <>
          <EventsProfile
            dataSetId={dataSetId}
            closeDrawer={() => setExploreView({ visible: false })}
            visible={exploreView.visible}
          />
        </>
      );

    return <></>;
  };

  const formik = useFormik({
    initialValues: {
      externalIdPrefix: '',
    },
    onSubmit: (values: any) => setAppliedFilters(values),
  });

  const onClearFilters = () => {
    setAppliedFilters({});
    formik.resetForm();
    setIsFilterVisible(false);
  };

  const onApplyFilters = () => {
    formik.handleSubmit();
    trackUsage({ e: 'data.sets.detail.data', filter: 'external-id' });
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

  if (
    !isAssetsLoading &&
    !isEventsLoading &&
    !isFilesLoading &&
    !isSequencesLoading &&
    !isTimeseriesLoading &&
    !debouncedQuery &&
    isEmptyDataset(
      assetsData?.length,
      eventsData?.length,
      filesData?.length,
      sequencesData?.length,
      timeseriesData?.length
    )
  ) {
    return <EmptyDataState />;
  }

  return (
    <ContentWrapper>
      <DetailsPane>
        <Flex direction="column">
          <Flex
            display="inline-flex"
            gap={8}
            alignItems="center"
            style={{ marginBottom: 6 }}
          >
            <Input
              value={query}
              icon="Search"
              placeholder={t('search')}
              onChange={(evt) => {
                const searchText = evt.currentTarget.value;
                trackUsage({ e: 'data.sets.detail.data', searchText });
                setQuery(searchText);
              }}
              style={{ width: 312 }}
              clearable={{
                callback: () => setQuery(''),
              }}
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
                  fullWidth
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
        <Tabs
          defaultActiveKey="assets"
          size="large"
          activeKey={activeResourceTabKey}
          onTabClick={activeResourceTabChangeHandler}
        >
          <Tabs.Tab
            tabKey="assets"
            label={t('assets')}
            iconLeft="Assets"
            disabled={assetCount === 0}
            chipRight={{
              label: assetCount.toLocaleString(),
              size: 'small',
            }}
          >
            <AssetsTable data={assetsData} isLoading={isAssetsLoading} />
          </Tabs.Tab>
          <Tabs.Tab
            tabKey="events"
            label={t('events')}
            iconLeft="Events"
            disabled={eventsCount === 0}
            chipRight={{
              label: eventsCount.toLocaleString(),
              size: 'small',
            }}
          >
            <EventsTable
              dataSetId={dataSetId}
              setExploreView={setExploreView}
              data={eventsData}
              isLoading={isEventsLoading}
            />
          </Tabs.Tab>
          <Tabs.Tab
            tabKey="files"
            label={t('files')}
            iconLeft="Document"
            disabled={filesCount === 0}
            chipRight={{
              label: filesCount.toLocaleString(),
              size: 'small',
            }}
          >
            <FilesTable data={filesData} isLoading={isFilesLoading} />
          </Tabs.Tab>
          <Tabs.Tab
            tabKey="sequences"
            label={t('sequence_other')}
            iconLeft="Sequences"
            disabled={sequencesCount === 0}
            chipRight={{
              label: sequencesCount.toLocaleString(),
              size: 'small',
            }}
          >
            <SequencesTable
              data={sequencesData}
              isLoading={isSequencesLoading}
            />
          </Tabs.Tab>
          <Tabs.Tab
            tabKey="timeseries"
            label={t('time-series')}
            iconLeft="Timeseries"
            disabled={timeseriesCount === 0}
            chipRight={{
              label: timeseriesCount.toLocaleString(),
              size: 'small',
            }}
          >
            <TimeseriesTable
              data={timeseriesData}
              isLoading={isTimeseriesLoading}
            />
          </Tabs.Tab>
        </Tabs>
        {exploreView.visible && renderExploreView()}
      </DetailsPane>
    </ContentWrapper>
  );
};

export default ExploreData;

const StyledTableFilterSection = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  padding: 16px;
`;
