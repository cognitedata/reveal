/**
 * ChartViewHeader Header StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import ChartViewHeader from './ChartViewHeader';

export default {
  component: ChartViewHeader,
  title: 'Components/ChartView',
} as Meta;

const Template: Story<ComponentProps<typeof ChartViewHeader>> = (args) => (
  <ChartViewHeader {...args} />
);

export const ChartHeader = Template.bind({});

ChartHeader.args = {
  userId: 'ec43cd7848c9-sf23k-llajk-f139xvmcn-234',
  isOwner: true,
  stackedMode: true,
  showSearch: true,
  showYAxis: true,
  showMinMax: true,
  showGridlines: true,
  mergeUnits: true,
  dateTo: new Date('2022-03-21T15:15:48.496Z'),
  dateFrom: new Date('2021-03-08T17:40:16.621Z'),
  setStackedMode: () => {},
  handleOpenSearch: () => {},
  handleClickNewWorkflow: () => {},
  handleImportCalculationsClick: () => {},
  handleSettingsToggle: () => {},
  handleDateChange: () => {},
};
