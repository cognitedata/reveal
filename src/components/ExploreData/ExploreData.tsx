import React, { useState, useEffect } from 'react';
import Col from 'antd/lib/col';
import Spin from 'antd/lib/spin';
import { ContentView, ItemLabel } from 'utils/styledComponents';
import EmptyState from 'components/EmptyState';
import {
  filesCounter,
  timeSeriesCounter,
  eventsCounter,
  assetsCounter,
  sequenceCounter,
} from 'utils/utils';
import { useUserInformation } from 'hooks/useUserInformation';
import EventsTable from '../EventsTable';
import AssetsTable from '../AssetsTable';
import TimeseriesTable from '../TimeseriesTable';
import FilesTable from '../FilesTable/FilesTable';
import SequencesTable from '../SequencesTable';
import { ExploreViewConfig } from '../../utils/types';
import EventsProfile from '../EventsProfile';
import ResourceCountBox from '../ResourceCountBox';
import { trackUsage } from '../../metrics';

interface ExploreDataProps {
  loading: boolean;
  dataSetId: number;
}

const ExploreData = ({ loading, dataSetId }: ExploreDataProps) => {
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
    filesCounter(dataSetId)
      .then((counter) => {
        setFilesCount(counter[0].count);
      })
      .catch(() => {
        setFilesCount(-1);
      });
    timeSeriesCounter(dataSetId)
      .then((counter) => {
        setTimeseriesCount(counter[0].count);
      })
      .catch(() => {
        setTimeseriesCount(-1);
      });
    eventsCounter(dataSetId)
      .then((counter) => {
        setEventsCount(counter[0].count);
      })
      .catch(() => {
        setEventsCount(-1);
      });
    assetsCounter(dataSetId)
      .then((counter) => {
        setAssetCount(counter[0].count);
      })
      .catch(() => {
        setAssetCount(-1);
      });
    sequenceCounter(dataSetId)
      .then((counter) => {
        setSequencesCount(counter[0].count);
      })
      .catch(() => {
        setSequencesCount(-1);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSetId]);

  // eslint-disable-next-line consistent-return
  const renderExploreView = () => {
    if (exploreView.type && exploreView.id) {
      trackUsage(`DataSets.DataExplore.Viewed resource`, email, {
        resourceType: exploreView.type,
      });
      if (exploreView.type === 'events-profile') {
        return (
          <EventsProfile
            dataSetId={dataSetId}
            closeDrawer={() => setExploreView({ visible: false })}
            visible={exploreView.visible}
          />
        );
      }
    }
  };

  const dataSetContainsData = () => {
    return !(
      assetCount === 0 &&
      sequencesCount === 0 &&
      timeseriesCount === 0 &&
      filesCount === 0 &&
      eventsCounts === 0
    );
  };
  if (dataSetContainsData()) {
    return (
      <Spin spinning={loading}>
        <ContentView>
          <ItemLabel>Data profile</ItemLabel>
          <Col
            span={24}
            style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}
          >
            <ResourceCountBox
              count={timeseriesCount}
              resourceName="Time series"
            />
            <ResourceCountBox count={assetCount} resourceName="Assets" />
            <ResourceCountBox
              count={eventsCounts}
              resourceName="Events"
              setExploreView={setExploreView}
              dataSetId={dataSetId}
            />
            <ResourceCountBox count={sequencesCount} resourceName="Sequences" />
            <ResourceCountBox count={filesCount} resourceName="Files" />
          </Col>
          {timeseriesCount > 0 && <TimeseriesTable dataSetId={dataSetId} />}
          {assetCount > 0 && <AssetsTable dataSetId={dataSetId} />}
          {eventsCounts > 0 && <EventsTable dataSetId={dataSetId} />}
          {filesCount > 0 && <FilesTable dataSetId={dataSetId} />}
          {sequencesCount > 0 && <SequencesTable dataSetId={dataSetId} />}

          {exploreView.visible && renderExploreView()}
        </ContentView>
      </Spin>
    );
  }
  return (
    <div style={{ marginTop: '10%' }}>
      <EmptyState
        type="DataSets"
        text="This data set contains no data"
        extra={
          <div>
            <a
              href="https://docs.cognite.com/cdf/data_governance/guides/datasets/create_data_sets.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Click here
            </a>{' '}
            to learn more on how to add data to your data set
          </div>
        }
      />
    </div>
  );
};

export default ExploreData;
