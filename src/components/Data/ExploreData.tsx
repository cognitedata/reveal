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
  ContentView,
  DetailsPane,
  trackUsage,
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
import { Input } from '@cognite/cogs.js';
import useDebounce from 'hooks/useDebounce';
import { useFlag } from '@cognite/react-feature-flags';

const { TabPane } = Tabs;

interface ExploreDataProps {
  loading: boolean;
  dataSetId: number;
}

const ExploreData = ({ loading, dataSetId }: ExploreDataProps) => {
  const { t } = useTranslation();
  const [activeResourceTabKey, setActiveResourceTabKey] = useState<
    string | undefined
  >(undefined);
  const [exploreView, setExploreView] = useState<ExploreViewConfig>({
    visible: false,
  });

  const { data } = useUserInformation();
  const email = data?.email;

  const [assetCount, setAssetCount] = useState<number>(0);
  const [eventsCounts, setEventsCount] = useState<number>(0);
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
  const debouncedQuery = useDebounce(query, 100);
  const { isEnabled } = useFlag('data-catalog');

  const dataSetContainsData = () => {
    return !(
      assetCount === 0 &&
      sequencesCount === 0 &&
      timeseriesCount === 0 &&
      filesCount === 0 &&
      eventsCounts === 0
    );
  };

  const activeResourceTabChangeHandler = (tabKey: string) => {
    setActiveResourceTabKey(tabKey);
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

  if (dataSetContainsData()) {
    return (
      <Spin spinning={loading}>
        <ContentView>
          <DetailsPane>
            {isEnabled && (
              <Input
                value={query}
                icon="Search"
                placeholder={t('search')}
                onChange={(evt) => {
                  setQuery(evt.currentTarget.value);
                }}
              />
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
                <AssetsTable dataSetId={dataSetId} query={debouncedQuery} />
              </TabPane>
              <TabPane
                tab={
                  <TabTitle
                    title={t('events')}
                    iconType="Events"
                    label={eventsCounts.toLocaleString()}
                    disabled={eventsCounts === 0}
                    isTooltip={eventsCounts < 0}
                    resource="events"
                  />
                }
                key="events"
                disabled={eventsCounts === 0}
              >
                <EventsTable
                  dataSetId={dataSetId}
                  setExploreView={setExploreView}
                  query={debouncedQuery}
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
                <FilesTable dataSetId={dataSetId} query={debouncedQuery} />
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
                <SequencesTable dataSetId={dataSetId} query={debouncedQuery} />
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
                <TimeseriesTable dataSetId={dataSetId} query={debouncedQuery} />
              </TabPane>
            </Tabs>
            {exploreView.visible && renderExploreView()}
          </DetailsPane>
        </ContentView>
      </Spin>
    );
  }

  return <EmptyDataState />;
};

export default ExploreData;
