/**
 * ChartViewHeader Header StoryBook
 */

import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import ChartViewHeader from './ChartViewHeader';

export default {
  component: ChartViewHeader,
  title: 'Components/Chart View Page/Chart View Header',
  argTypes: {
    setStackedMode: { action: 'Clicked on Stacked Mode' },
    handleOpenSearch: { action: 'Clicked to Open the Search' },
    handleClickNewWorkflow: { action: 'Clicked to create a new Calculation' },
    handleImportCalculationsClick: { action: 'Clicked to import calculations' },
    handleSettingsToggle: { action: 'Changed chart settings' },
    handleDateChange: { action: 'Changed Date Period' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof ChartViewHeader>> = (args) => (
  <ChartViewHeader {...args} />
);

export const DevOrStaging = Template.bind({});

DevOrStaging.args = {
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
};

export const Production = Template.bind({});

Production.args = {
  ...DevOrStaging.args,
  handleImportCalculationsClick: undefined,
};
