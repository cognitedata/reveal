import React from 'react';
import styled from 'styled-components';
import { Timeseries } from 'cognite-sdk-v3';
import { LatestDatapoint } from './LatestDatapoint';

const exampleTimeSeries: Timeseries[] = [
  {
    id: 5927592366707648,
    createdTime: new Date(1580503121335),
    lastUpdatedTime: new Date(1580503121335),
    name: '001wdtQD',
    description: 'asdasd',
    isString: false,
    isStep: false,
    dataSetId: 1640958057260772,
    metadata: {
      someAttribute: 'Some value',
      someOtherAttribute: 'Some other value',
    },
  },
  {
    id: 1078526410338179,
    createdTime: new Date(1580499955575),
    lastUpdatedTime: new Date(1580499955575),
    name: '00F9ZHV6',
    description: 'asdasd',
    isString: false,
    isStep: false,
    dataSetId: 1640958057260772,
  },
];

export default { title: 'Atoms/LatestDatapoint', component: LatestDatapoint };

export const Example = () => (
  <Container>
    <div style={{ marginRight: 50 }}>
      <LatestDatapoint timeSeries={exampleTimeSeries[0]} />
    </div>
  </Container>
);

const Container = styled.div`
  padding: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
`;
