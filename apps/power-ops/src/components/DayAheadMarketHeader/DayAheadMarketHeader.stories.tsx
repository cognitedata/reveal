import { Meta, Story } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { ComponentProps } from 'react';
import { expect } from '@storybook/jest';

import { DayAheadMarketHeader } from './DayAheadMarketHeader';

export default {
  component: DayAheadMarketHeader,
  title: 'Components/Day Ahead Market Header',
  argTypes: {
    onChangeShowConfirmDownloadModal: { action: 'show confirm download modal' },
    onChangeProcessConfigurationExternalId: { action: 'select method' },
    onDownloadMatrix: { action: 'downloading' },
    onDownloadButtonClick: { action: 'download button click' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof DayAheadMarketHeader>> = (args) => (
  <DayAheadMarketHeader {...args} />
);

export const Default = Template.bind({});

Default.args = {
  bidProcessExternalId: 'bid_process_external_id_1',
  startDate: 'Today 13:12 UTC +01:00',
  priceAreaName: 'NO1',
  processConfigurations: [
    {
      bidProcessEventExternalId: 'bid_process_external_id_1',
      bidProcessConfiguration: 'multi_scenario_NO1',
      bidProcessFinishedDate: new Date('2022-11-10T12:58:40.892Z'),
    },
    {
      bidProcessEventExternalId: 'bid_process_external_id_2',
      bidProcessConfiguration: 'multi_scenario_NO1',
      bidProcessFinishedDate: new Date('2022-11-10T12:58:40.892Z'),
    },
  ],
};

export const Interactions = Template.bind({});

Interactions.args = { ...Default.args };

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  const downloadButton = canvas.getByTestId('download-button');
  await userEvent.click(downloadButton);
  expect(args.onDownloadButtonClick).toBeCalled();

  const methodSelector = canvas.getByTestId('method-button');
  await userEvent.click(methodSelector);
  const methodSelectorMenu = canvas.getByTestId('method-selector-menu');
  expect(methodSelectorMenu).toBeInTheDocument();

  const selectNewMethod = canvas
    .getAllByTestId('method-selector-menu-item')
    .slice(-1)[0];
  await userEvent.click(selectNewMethod);
  expect(args.onChangeProcessConfigurationExternalId).toBeCalled();
};
