import { Meta, Story } from '@storybook/react';
import OpenAsChartLink from './OpenAsChartLink';

type Props = React.ComponentProps<typeof OpenAsChartLink>;

export default {
  component: OpenAsChartLink,
  title: 'Components/Open As Chart Link',
} as Meta;

const Template: Story<Props> = (args) => <OpenAsChartLink {...args} />;

export const Demo = Template.bind({});

Demo.args = {
  timeseriesIds: [123],
  timeseriesExternalIds: ['asdv'],
  startDate: new Date(),
  endDate: new Date(),
  project: 'fusion',
};
