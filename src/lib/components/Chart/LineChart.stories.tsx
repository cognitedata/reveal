import React from 'react';
import styled from 'styled-components';
import { datapoints } from 'lib/stubs/timeseriesData';
import { LineChart } from './LineChart';

export default {
  title: 'Component/Chart',
  component: LineChart,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <LineChart values={datapoints.items[0].datapoints} width={800} height={300} />
);

const Container = styled.div`
  padding: 20px;
  height: 600px;
  width: 100%;
`;
