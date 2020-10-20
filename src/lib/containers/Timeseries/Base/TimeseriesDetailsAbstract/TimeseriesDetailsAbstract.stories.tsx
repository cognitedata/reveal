import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { timeseries } from 'stubs/timeseries';
import { TimeseriesDetailsAbstract } from './TimeseriesDetailsAbstract';

export default {
  title: 'Time Series/Base/TimeseriesDetailsAbstract',
  component: TimeseriesDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return <TimeseriesDetailsAbstract timeSeries={timeseries[0]} />;
};

export const WithActions = () => {
  return (
    <TimeseriesDetailsAbstract
      timeSeries={timeseries[0]}
      actions={[
        <Button key="1" type="primary">
          Click me
        </Button>,
        <Button key="2">Click me too</Button>,
      ]}
    />
  );
};
export const WithExtras = () => {
  return (
    <TimeseriesDetailsAbstract
      timeSeries={timeseries[0]}
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
  return <Wrapper>{children}</Wrapper>;
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
