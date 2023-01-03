/**
 * Histogram component Story
 */

import { Meta, Story } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import Histogram from './Histogram';

type Props = React.ComponentProps<typeof Histogram>;

export default {
  component: Histogram,
  title: 'Components/DataProfiling/Histogram',
} as Meta;

const MockedDataProfilingHistogram = (args: any) => {
  return <Histogram {...args} />;
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <RecoilRoot>
        <MockedDataProfilingHistogram {...args} />
      </RecoilRoot>
    </div>
  );
};

export const Empty = Template.bind({});
export const All = Template.bind({});

Empty.args = {
  noDataText: 'No histogram data available',
  unitLabel: '',
  histogramType: 'density',
  data: [],
};

All.args = {
  noDataText: 'No histogram data available',
  unitLabel: 'Density',
  histogramType: 'density',
  data: [
    {
      quantity: 1,
      range_end: 1.5,
      range_start: 1.0,
    },
    {
      quantity: 1,
      range_end: 2.0,
      range_start: 1.5,
    },
    {
      quantity: 0,
      range_end: 2.5,
      range_start: 2.0,
    },
    {
      quantity: 1,
      range_end: 3.0,
      range_start: 2.5,
    },
    {
      quantity: 0,
      range_end: 3.5,
      range_start: 3.0,
    },
    {
      quantity: 1,
      range_end: 4.0,
      range_start: 3.5,
    },
    {
      quantity: 0,
      range_end: 4.5,
      range_start: 4.0,
    },
    {
      quantity: 1,
      range_end: 5.0,
      range_start: 4.5,
    },
    {
      quantity: 0,
      range_end: 5.5,
      range_start: 5.0,
    },
    {
      quantity: 3965,
      range_end: 6.0,
      range_start: 5.5,
    },
  ],
};
