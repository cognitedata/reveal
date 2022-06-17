import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import Sparkline from './Sparkline';

type Props = React.ComponentProps<typeof Sparkline>;

export default {
  component: Sparkline,
  title: 'Components/Plotly Chart/Sparkline',
} as Meta;

const Template: Story<Props> = (args) => (
  <Sparkline
    {...args}
    width={170}
    height={70}
    startDate={dayjs('1989-12-22T00:00:00Z').toDate()}
    endDate={dayjs('1989-12-22T00:00:00Z').subtract(-99, 'minute').toDate()} // https://github.com/storybookjs/storybook/issues/12208
  />
);

export const AverageMinMax = Template.bind({});

AverageMinMax.args = {
  datapoints: Array(100)
    .fill(1)
    .map((_v, i) => ({
      timestamp: dayjs('1989-12-22T00:00:00Z').add(i, 'minute').toDate(),
      average: i % 10,
      min: (i % 10) / 2,
      max: (i % 10) * 2,
    })),
};

export const FewDatapoints = Template.bind({});

FewDatapoints.args = {
  datapoints: Array(10)
    .fill(1)
    .map((_v, i) => ({
      timestamp: dayjs('1989-12-22T00:00:00Z').add(i, 'minute').toDate(),
      average: i % 10,
      min: (i % 10) / 2,
      max: (i % 10) * 2,
    })),
};

export const OnlyAverage = Template.bind({});

OnlyAverage.args = {
  datapoints: Array(100)
    .fill(1)
    .map((_v, i) => ({
      timestamp: dayjs('1989-12-22T00:00:00Z').add(i, 'minute').toDate(),
      average: i % 10,
    })),
};

export const RawDatapoints = Template.bind({});

RawDatapoints.args = {
  datapoints: Array(100)
    .fill(1)
    .map((_v, i) => ({
      timestamp: dayjs('1989-12-22T00:00:00Z').add(i, 'minute').toDate(),
      value: Math.sin(i),
    })),
};

export const Loading = Template.bind({});

Loading.args = {
  loading: true,
  datapoints: [],
};

export const TransparentBackgroundTest = () => (
  <div style={{ backgroundColor: 'red', width: 300, height: 300 }}>
    <Sparkline
      startDate={dayjs('1989-12-22T00:00:00Z').toDate()}
      endDate={dayjs('1989-12-22T00:00:00Z').subtract(-99, 'minute').toDate()} // https://github.com/storybookjs/storybook/issues/12208
      datapoints={Array(100)
        .fill(1)
        .map((_v, i) => ({
          timestamp: dayjs('1989-12-22T00:00:00Z').add(i, 'minute').toDate(),
          average: i % 10,
          min: (i % 10) / 2,
          max: (i % 10) * 2,
        }))}
      width={170}
      height={70}
    />
  </div>
);
