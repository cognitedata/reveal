import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import '@cognite/cogs.js/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';
import { Timeseries } from '@cognite/sdk';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { TimeseriesDetailsAbstract } from './TimeseriesDetailsAbstract';

const exampleTimeSeries: Timeseries = {
  id: 5927592366707648,
  createdTime: new Date(1580503121335),
  lastUpdatedTime: new Date(1580503121335),
  name: '001wdtQD',
  description: 'asdasd',
  unit: 'pressure',
  isString: false,
  isStep: false,
  dataSetId: 1640958057260772,
  metadata: {
    someAttribute: 'Some value',
    someOtherAttribute: 'Some other value',
  },
};

export default {
  title: 'Organisms/TimeseriesDetailsAbstract',
  component: TimeseriesDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return <TimeseriesDetailsAbstract timeSeries={exampleTimeSeries} />;
};

export const WithActions = () => {
  return (
    <TimeseriesDetailsAbstract
      timeSeries={exampleTimeSeries}
      actions={[
        <Button type="primary">Click me</Button>,
        <Button>Click me too</Button>,
      ]}
    />
  );
};
export const WithExtras = () => {
  return (
    <TimeseriesDetailsAbstract
      timeSeries={exampleTimeSeries}
      extras={
        <Button
          type="primary"
          variant="ghost"
          shape="round"
          icon="VerticalEllipsis"
        />
      }
    />
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResourceSelectionProvider>
      <Wrapper>{children}</Wrapper>
    </ResourceSelectionProvider>
  );
};

const Wrapper = styled.div`
  padding: 20px;
  width: 400px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;

  && > * {
    background: #fff;
  }
`;
