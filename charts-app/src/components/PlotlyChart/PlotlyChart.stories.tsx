import { Meta, Story } from '@storybook/react';
import PlotlyChart from './PlotlyChart';
import {
  plotExamplePropsWithAggregatedData,
  plotExamplePropsWithRawData,
} from './PlotlyChart.mocks';

type Props = React.ComponentProps<typeof PlotlyChart>;

export default {
  component: PlotlyChart,
  title: 'Components/Plotly Chart/Chart',
} as Meta;

const Template: Story<Props> = (args) => <PlotlyChart {...args} />;

export const EmptyDataPlot = Template.bind({});

EmptyDataPlot.args = {
  dateFrom: '2022-05-06T11:00:00.000',
  dateTo: '2022-05-06T12:00:00.000',
};

export const AggregatedDataPlot = Template.bind({});

AggregatedDataPlot.args = plotExamplePropsWithAggregatedData as Props;

export const RawDataPlot = Template.bind({});

RawDataPlot.args = plotExamplePropsWithRawData as Props;
