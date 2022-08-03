import React from 'react';
import styled from 'styled-components';
import { datapoints } from 'stubs/timeseriesDatapoints';
import { LineChart } from './LineChart';

export default {
  title: 'Component/Chart',
  component: LineChart,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  const values = datapoints[0].datapoints as any;
  return <LineChart values={values} width={800} height={300} />;
};

const Container = styled.div`
  padding: 20px;
  height: 600px;
  width: 100%;
`;
