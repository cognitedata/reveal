import React from 'react';
import styled from 'styled-components';
import { TimeseriesChart } from './TimeseriesChart';

export default {
  title: 'Time series/TimeseriesChart',
  component: TimeseriesChart,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => <TimeseriesChart timeseriesId={123} />;

const Container = styled.div`
  padding: 20px;
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
