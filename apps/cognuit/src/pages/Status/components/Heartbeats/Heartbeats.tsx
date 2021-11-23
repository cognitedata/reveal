import { useState, FC } from 'react';
import { Tabs } from '@cognite/cogs.js';
import { Source } from 'typings/interfaces';
import { HeartbeatsResponse } from 'types/ApiInterface';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { useSourceHeartbeatQuery } from 'services/endpoints/sources/query';
import { ThirdPartySystems } from 'types/globalTypes';

import { DATE_RANGE_VALUES, DateRangeValueType } from '../../utils';

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

interface Props {
  dateRange: DateRangeValueType;
  afterTimestamp: number;
}

// TODO(CWP-1817) List connector instances from API and get their names dynamically?
const PSC_PROD = 'psc_prod';
const OWC_PROD = 'ienergy-prod';

const Heartbeats: FC<Props> = ({ dateRange, afterTimestamp }) => {
  const [activeTabKey, setActiveTabKey] = useState<string>('psToOw');

  const { data: psHeartbeats, isLoading: psLoading } = useSourceHeartbeatQuery({
    source: Source.STUDIO,
    instance: PSC_PROD,
    after: afterTimestamp,
    enabled: activeTabKey === 'psToOw',
  });

  const { data: owHeartbeats, isLoading: owLoading } = useSourceHeartbeatQuery({
    source: Source.OPENWORKS,
    instance: OWC_PROD,
    after: afterTimestamp,
    enabled: activeTabKey === 'owToPs',
  });

  function handleTabChange(key: string) {
    setActiveTabKey(key);
  }

  const renderChart = (type: string, heartbeats: HeartbeatsResponse) => {
    const getStatus = () => (
      <StatusText>
        {type === 'ps' ? ThirdPartySystems.PS : ThirdPartySystems.OW} connector
        status: <strong>{heartbeats.length > 0 ? 'on' : 'off'}</strong>
      </StatusText>
    );

    const getBars = (heartbeats: HeartbeatsResponse) => {
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

    return (
      <ChartContainer key={type} xScroll={heartbeats.length > 0}>
        {psLoading || owLoading ? (
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
        <Tabs.TabPane
          tab={`${ThirdPartySystems.PS} to ${ThirdPartySystems.OW}`}
          key="psToOw"
        >
          {renderChart('ps', psHeartbeats)}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={`${ThirdPartySystems.OW} to ${ThirdPartySystems.PS}`}
          key="owToPs"
        >
          {renderChart('ow', owHeartbeats)}
        </Tabs.TabPane>
      </Tabs>
    </Container>
  );
};

export default Heartbeats;
