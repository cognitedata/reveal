/**
 * Boxplot component Story
 */

import { Meta, Story } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import Boxplot from './Boxplot';

type Props = React.ComponentProps<typeof Boxplot>;

export default {
  component: Boxplot,
  title: 'Components/DataProfiling/Boxplot',
} as Meta;

const MockedDataProfilingBoxplot = (args: any) => {
  return <Boxplot {...args} />;
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <RecoilRoot>
        <MockedDataProfilingBoxplot {...args} />
      </RecoilRoot>
    </div>
  );
};

export const Empty = Template.bind({});
export const All = Template.bind({});

Empty.args = {
  noDataText: 'No boxplot data available',
  boxplotType: 'timedelta',
  data: undefined,
};

All.args = {
  noDataText: 'No boxplot data available',
  boxplotType: 'density',
  data: {
    lower_whisker: 1.0,
    outliers: [],
    q25: 5.75,
    q50: 10.5,
    q75: 15.25,
    upper_whisker: 20.0,
  },
};
