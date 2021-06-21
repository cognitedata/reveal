import React, { ReactNode } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Icon } from '@cognite/cogs.js';
import DelayedComponent from 'components/DelayedComponent';
import { TimeseriesChart } from '@cognite/data-exploration';
import { Timeseries } from '@cognite/sdk';

export default function TimeseriesSearchHit({
  timeseries,
  renderCheckbox,
}: {
  timeseries: Timeseries[] | undefined;
  renderCheckbox: (timeseries: Timeseries) => ReactNode;
}) {
  const sparklineStartDate = dayjs()
    .subtract(1, 'years')
    .startOf('day')
    .toDate();
  const sparklineEndDate = dayjs().endOf('day').toDate();
  return (
    <>
      {timeseries?.map((t, i) => (
        <TSItem key={t.id}>
          <Row>
            <Right>
              {renderCheckbox(t)}
              <InfoContainer>
                <ResourceNameWrapper>
                  <Icon type="ResourceTimeseries" style={{ minWidth: 14 }} />
                  <span style={{ marginLeft: 5 }}>{t.name}</span>
                </ResourceNameWrapper>
                <Description>{t.description}</Description>
              </InfoContainer>
            </Right>
            <Right>
              <DelayedComponent delay={250 + i}>
                <div style={{ width: 190 }}>
                  <TimeseriesChart
                    height={65}
                    showSmallerTicks
                    timeseriesId={t.id}
                    numberOfPoints={25}
                    showAxis="horizontal"
                    timeOptions={[]}
                    showContextGraph={false}
                    showPoints={false}
                    enableTooltip={false}
                    showGridLine="none"
                    minRowTicks={2}
                    dateRange={[sparklineStartDate, sparklineEndDate]}
                  />
                </div>
              </DelayedComponent>
            </Right>
          </Row>
        </TSItem>
      ))}
    </>
  );
}

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  word-break: break-word;
`;

const ResourceNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: top;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const Description = styled.span`
  margin-left: 20px;
  font-size: 10px;
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
`;
