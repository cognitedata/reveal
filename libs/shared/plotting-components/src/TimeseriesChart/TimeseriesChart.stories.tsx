import { Story } from '@storybook/react';

import { TimeseriesChart } from './TimeseriesChart';

export default {
  title: 'Shared/PlottingComponents/TimeseriesChart',
  component: TimeseriesChart,
};

const Template: Story<any> = (args) => <TimeseriesChart {...args} />;

export const Basic = Template.bind({});
Basic.args = {};
