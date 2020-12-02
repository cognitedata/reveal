import React, { useEffect, useState } from 'react';
import { Row, Col, Menu, Dropdown, Button } from '@cognite/cogs.js';
import Card from 'components/Atoms/Card';
import { StatusContainer, CardContent, HeadingContainer } from './elements';
import StatusCardHeader from './StatusCardHeader';
import Heartbeats from './Heartbeats';
import { DropdownLabel } from '../DataTransfers/elements';
import {
  DATE_RANGE_VALUES,
  DateRangeValueType,
  getTimestampParamForDateRange,
} from './utils';
import ErrorDistribution from './ErrorDistribution';
import TranslationStatistics from './TranslationStatistics';

const Status = () => {
  const [dateRangeOpen, setDateRangeOpen] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRangeValueType
  >(DATE_RANGE_VALUES.lastMonth);
  const [afterTimestamp, setAfterTimestamp] = useState<number>(
    getTimestampParamForDateRange(DATE_RANGE_VALUES.lastMonth)
  );

  function handleDateRangeChange(value: DateRangeValueType) {
    setSelectedDateRange(value);
  }

  useEffect(() => {
    const timestamp = getTimestampParamForDateRange(selectedDateRange);
    setAfterTimestamp(timestamp);
  }, [selectedDateRange]);

  const MenuContent = (
    <Menu>
      {Object.keys(DATE_RANGE_VALUES).map((item: string) => (
        <Menu.Item
          key={item}
          onClick={() => {
            handleDateRangeChange(DATE_RANGE_VALUES[item]);
            setDateRangeOpen(false);
          }}
        >
          {DATE_RANGE_VALUES[item]}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <StatusContainer>
      <Row gutter={24}>
        <Col span={24}>
          <HeadingContainer>
            <h1>Status - {selectedDateRange}</h1>
            <Dropdown
              content={MenuContent}
              visible={dateRangeOpen}
              onClickOutside={() => setDateRangeOpen(false)}
            >
              <>
                <DropdownLabel>Date range</DropdownLabel>
                <Button
                  icon="Select"
                  iconPlacement="right"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDateRangeOpen(!dateRangeOpen);
                  }}
                >
                  {selectedDateRange}
                </Button>
              </>
            </Dropdown>
          </HeadingContainer>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={17}>
          <Row>
            <Col span={24}>
              <Card>
                <StatusCardHeader title="Heartbeat for connectors" />
                <CardContent>
                  <Heartbeats
                    dateRange={selectedDateRange}
                    afterTimestamp={afterTimestamp}
                  />
                </CardContent>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card>
                <StatusCardHeader title="Translation statistics" />
                <CardContent>
                  <TranslationStatistics dateRange={selectedDateRange} />
                  <div style={{ fontStyle: 'italic', marginTop: 20 }}>
                    NOTE: Above translation statistics data are only mock data
                    for demo purposes, not real translation data
                  </div>
                </CardContent>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={7}>
          <Row>
            <Col span={24}>
              <Card>
                <StatusCardHeader title="Error distribution" />
                <CardContent>
                  <ErrorDistribution afterTimestamp={afterTimestamp} />
                  <div style={{ fontStyle: 'italic' }}>
                    NOTE: Above error data are only mock data for demo purposes,
                    not real error data
                  </div>
                </CardContent>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </StatusContainer>
  );
};

export default Status;
