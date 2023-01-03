/**
 * Metrics component Story
 */

import { Meta, Story } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import Metrics from './Metrics';

type Props = React.ComponentProps<typeof Metrics>;

export default {
  component: Metrics,
  title: 'Components/DataProfiling/Metrics',
} as Meta;

const MockedDataProfilingMetrics = (args: any) => {
  return <Metrics {...args} />;
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '350px' }}>
      <RecoilRoot>
        <MockedDataProfilingMetrics {...args} />
      </RecoilRoot>
    </div>
  );
};

export const All = Template.bind({});

All.args = {
  dataSource: [
    {
      label: 'Number of gaps',
      value: 2,
      tooltip:
        'If time between two data points is more than 1.5 multiple of the inter quatile range (IQR) of all time deltas it is defined as a gap',
    },
    {
      label: 'Avg. gap length',
      value: 1000,
      tooltip: 'Length of average gap',
    },
    {
      label: 'Max. gap length',
      value: 2000,
      tooltip: 'Length of largest gap',
    },
  ],
};
