import { DoubleDatapoint, FileInfo, Timeseries } from '@cognite/sdk';
import useTimeSeriesListQuery from 'hooks/useQuery/useTimeSeriesListQuery';
import StatusMessage from 'components/utils/StatusMessage';
import { Dropdown, Flex, Icon, Menu, Overline } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';
import useDatapointsQuery from 'hooks/useQuery/useDatapointsQuery';
import moment from 'moment';
import TimeSeriesPreview from 'components/explorer/TimeSeriesPreview';
import isNumber from 'lodash/isNumber';

import Card from '../Card';

import { TimeSeriesSelector } from './elements';

export type TimeSeriesCardProps = {
  assetId: number;
  onHeaderClick?: () => void;
  // descriptionField?: string;
  // onFileClick?: (file: FileInfo) => void;
};

const TimeSeriesCard = ({ assetId, onHeaderClick }: TimeSeriesCardProps) => {
  const [selectedTs, setSelectedTs] = useState<Timeseries>();
  const {
    data: timeSeriesList,
    isLoading,
    error,
  } = useTimeSeriesListQuery(
    {
      filter: { assetIds: [assetId] },
      limit: 10,
    },
    {
      onSuccess: (data) => {
        setSelectedTs(data[0]);
      },
    }
  );
  const { data: datapoints } = useDatapointsQuery(
    selectedTs ? [{ id: selectedTs.id }] : undefined,
    {
      latestOnly: true,
    }
  );
  const latestDatapoint = useMemo(
    () => datapoints?.[0]?.datapoints[0] as DoubleDatapoint,
    [datapoints]
  );
  const latestDatapointValue = useMemo(
    () =>
      isNumber(latestDatapoint?.value)
        ? latestDatapoint?.value.toPrecision(8)
        : latestDatapoint?.value,
    [latestDatapoint]
  );

  const renderTimeSeriesSelector = (selectedTimeSeries: Timeseries) => {
    return (
      <Dropdown
        content={
          <Menu>
            {timeSeriesList?.map((ts) => (
              <Menu.Item
                key={ts.id}
                onClick={() => setSelectedTs(ts)}
                style={{
                  overflowWrap: 'anywhere',
                  display: 'block',
                  textAlign: 'left',
                }}
              >
                {ts.name}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <TimeSeriesSelector>
          {selectedTimeSeries.name}
          <Icon type="ChevronDown" />
        </TimeSeriesSelector>
      </Dropdown>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <StatusMessage type="Loading" />;
    }
    if (error) {
      return <StatusMessage type="Error" />;
    }
    if (!timeSeriesList || (timeSeriesList || []).length === 0) {
      return <StatusMessage type="Missing.TimeSeries" />;
    }
    const selectedTimeSeries = selectedTs || timeSeriesList[0];
    return (
      <Flex style={{ height: '100%', flexFlow: 'column' }}>
        <div>
          <Overline level={1}>
            {renderTimeSeriesSelector(selectedTimeSeries)}
          </Overline>
          <Flex justifyContent="space-between" style={{ width: '100%' }}>
            <span>
              {latestDatapointValue} {selectedTimeSeries?.unit}
            </span>
            <span>{moment(latestDatapoint?.timestamp).fromNow()}</span>
          </Flex>
        </div>
        <div style={{ flexGrow: 1 }}>
          <TimeSeriesPreview timeSeries={selectedTimeSeries} showYAxis />
        </div>
      </Flex>
    );
  };

  return (
    <Card
      header={{ title: 'Time Series', icon: 'Timeseries' }}
      onClick={onHeaderClick}
    >
      {renderContent()}
    </Card>
  );
};

export default TimeSeriesCard;
