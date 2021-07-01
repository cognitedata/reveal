import { useState, useEffect, useContext, useCallback } from 'react';
import { Tabs } from 'antd';
import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { SourcesHeartbeatsResponse } from 'types/ApiInterface';
import { CustomError } from 'services/CustomError';
import { ThirdPartySystems } from 'types/globalTypes';

import { DATE_RANGE_VALUES, DateRangeValueType } from '../utils';
import EmptyTableMessage from '../../../components/Molecules/EmptyTableMessage/EmptyTableMessage';

import {
  Container,
  ChartContainer,
  DateItem,
  BarsContainer,
  BarWrapper,
  Bar,
  ItemWrapper,
  StatusText,
  OnOfWrapper,
} from './elements';
import { getDayDates, getHourDates, getMonthDates } from './utils';

type Props = {
  dateRange: DateRangeValueType;
  afterTimestamp: number;
};

const { TabPane } = Tabs;
const Heartbeats = ({ dateRange, afterTimestamp }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('psToOw');
  const [psHeartbeats, setPsHeartbeats] = useState<SourcesHeartbeatsResponse>(
    []
  );
  const [owHeartbeats, setOwHeartbeats] = useState<SourcesHeartbeatsResponse>(
    []
  );
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const setBeats = useCallback(
    (response: SourcesHeartbeatsResponse, source: string) => {
      if (response && Array.isArray(response)) {
        if (response.length === 0 || response.length > 0) {
          if (source === 'ps') {
            setPsHeartbeats(response);
          } else {
            setOwHeartbeats(response);
          }
        }
      }
      setIsLoading(false);
    },
    [setPsHeartbeats, setOwHeartbeats]
  );

  const fetchBeats = useCallback(() => {
    setIsLoading(true);
    if (activeTabKey === 'psToOw') {
      api!.sources
        .getHeartbeats(
          'Studio',
          Math.floor(afterTimestamp / UNIX_TIMESTAMP_FACTOR)
        )
        .then((response: SourcesHeartbeatsResponse) => {
          setBeats(response, 'ps');
        })
        .catch((err: CustomError) => {
          addError(err.message, err.status);
        });
    } else {
      api!.sources
        .getHeartbeats(
          'Openworks',
          Math.floor(afterTimestamp / UNIX_TIMESTAMP_FACTOR)
        )
        .then((owResponse: SourcesHeartbeatsResponse) => {
          setBeats(
            owResponse.sort((a, b) => Number(a) - Number(b)),
            'ow'
          );
        })
        .catch((err: CustomError) => {
          addError(err.message, err.status);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [afterTimestamp, api, setBeats, activeTabKey]);

  useEffect(() => {
    fetchBeats();
    // eslint-disable-next-line
  }, [afterTimestamp, activeTabKey]);

  function handleTabChange(key: string) {
    setActiveTabKey(key);
  }

  const getBars = (heartbeats: SourcesHeartbeatsResponse) => {
    let items: { date: string; isOn: string | undefined }[] = [];
    if (dateRange === DATE_RANGE_VALUES.lastMonth) {
      items = getMonthDates(heartbeats);
      if (items.length < 1) {
        return null;
      }
    } else if (dateRange === DATE_RANGE_VALUES.lastDay) {
      items = getDayDates(heartbeats);
      if (items.length < 1) {
        return null;
      }
    } else if (dateRange === DATE_RANGE_VALUES.lastHour) {
      items = getHourDates(heartbeats);
      if (items.length < 1) {
        return null;
      }
    }
    return (
      <BarsContainer>
        <OnOfWrapper>
          <div>On</div>
          <div>Off</div>
        </OnOfWrapper>
        {items.reverse().map((item) => (
          <ItemWrapper key={item.date.toString()}>
            <BarWrapper>
              <Bar isOn={item.isOn !== undefined} />
            </BarWrapper>
            <DateItem>{item.date}</DateItem>
          </ItemWrapper>
        ))}
      </BarsContainer>
    );
  };

  const renderChart = (type: string, heartbeats: SourcesHeartbeatsResponse) => {
    const getStatus = () => (
      <StatusText>
        {type === 'ps' ? ThirdPartySystems.PS : ThirdPartySystems.OW} connector
        status: <strong>{heartbeats.length > 0 ? 'on' : 'off'}</strong>
      </StatusText>
    );

    return (
      <ChartContainer key={type} xScroll={heartbeats.length > 0}>
        {isLoading ? (
          <EmptyTableMessage isLoading text="Loading" />
        ) : (
          <>
            {getStatus()}
            {heartbeats.length > 0 ? (
              getBars(heartbeats)
            ) : (
              <EmptyTableMessage text="No data" />
            )}
          </>
        )}
      </ChartContainer>
    );
  };

  return (
    <Container>
      <Tabs defaultActiveKey="psToOw" onChange={handleTabChange}>
        <TabPane tab="Petrel to OpenWorks" key="psToOw">
          {renderChart('ps', psHeartbeats)}
        </TabPane>
        <TabPane tab="OpenWorks to Petrel" key="owToPs">
          {renderChart('ow', owHeartbeats)}
        </TabPane>
      </Tabs>
    </Container>
  );
};

export default Heartbeats;
