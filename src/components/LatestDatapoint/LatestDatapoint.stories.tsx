import React from 'react';
import styled from 'styled-components';
import { Timeseries } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';
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

export default {
  title: 'Component/Uses Context/LatestDatapoint',
  component: LatestDatapoint,
  decorators: [
    (storyFn: any) => (
      <Container>
        <SDKProvider sdk={sdkMock}>{storyFn()}</SDKProvider>
      </Container>
    ),
  ],
};
const sdkMock = {
  timeseries: {
    retrieveLatest: async () => [{ datapoints: [1] }],
  },
};
export const Example = () => (
  <LatestDatapoint timeSeries={exampleTimeSeries[0]} />
);

const Container = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
