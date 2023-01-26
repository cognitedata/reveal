import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { DayAheadMarketHeader } from 'components/DayAheadMarketHeader/DayAheadMarketHeader';
import {
  mockDayAheadMarketHeaderData,
  mockProcessConfigurations,
} from 'components/DayAheadMarketHeader/DayAheadMarketHeader.mock';
import { expect } from '@storybook/jest';
import { boxDecorator } from 'utils/test/storyDecorators';

const box = boxDecorator({ width: 1366, height: 638 });

export default {
  component: DayAheadMarketHeader,
  title: 'Components/Day Ahead Market Header',
  argTypes: {
    onChangeShowConfirmDownloadModal: {
      action: 'Tried to Open/Close Download Modal',
    },
    onChangeProcessConfigurationExternalId: {
      action: 'Process Configuration Changed',
    },
    onDownloadMatrix: { action: 'Download Matrix' },
    onDownloadButtonClick: { action: 'Download Button Clicked' },
  },
  args: {
    bidProcessExternalId:
      mockProcessConfigurations[0].bidProcessEventExternalId,
    startDate: mockDayAheadMarketHeaderData.startDate,
    processConfigurations: mockProcessConfigurations,
    priceAreaName: mockDayAheadMarketHeaderData.priceAreaName,
    showConfirmDownloadModal: false,
    downloading: false,
  },
} as Meta;

const Template: Story<ComponentProps<typeof DayAheadMarketHeader>> = (args) => (
  <DayAheadMarketHeader {...args} />
);

export const Default = Template.bind({});

export const Downloading = Template.bind({});
Downloading.args = {
  downloading: true,
};

export const MethodSelector = Template.bind({});
MethodSelector.decorators = [box];
MethodSelector.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const methodSelector = await canvas.findByText('Method:');
  userEvent.click(methodSelector);
};

export const ConfirmationModal = Template.bind({});
ConfirmationModal.args = {
  showConfirmDownloadModal: true,
};
ConfirmationModal.decorators = [box];
ConfirmationModal.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const modal = await canvas.findByText(
    'Are you sure you want to download this bid?'
  );
  expect(modal).toBeInTheDocument();
  expect(await canvas.findByText('Download anyway')).toBeInTheDocument();

  const closeButton = await canvas.findAllByRole('button', { hidden: true });
  userEvent.click(closeButton[3]);
  const downloadButton = await canvas.findByText('Download anyway');
  userEvent.click(downloadButton);
  expect(args.onDownloadMatrix).toBeCalledWith(
    mockProcessConfigurations[0].bidProcessEventExternalId
  );
  expect(args.onChangeShowConfirmDownloadModal).toBeCalledWith(false);
};

export const Interactions = Template.bind({});
Interactions.decorators = [box];
Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const downloadButton = await canvas.findByText('Download');
  userEvent.click(downloadButton);
  expect(args.onDownloadButtonClick).toBeCalled();

  const methodSelector = await canvas.findByText('Method:');
  userEvent.click(methodSelector);
  const newMethod = await canvas.findByText('Price independent');
  userEvent.click(newMethod);
  expect(args.onChangeProcessConfigurationExternalId).toBeCalledWith(
    mockProcessConfigurations[1].bidProcessEventExternalId
  );
};
