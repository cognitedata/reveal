import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { screen, userEvent, within } from '@storybook/testing-library';
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

export const ConfirmationModal = Template.bind({});

ConfirmationModal.args = {
  showConfirmDownloadModal: true,
};
ConfirmationModal.decorators = [box];
ConfirmationModal.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const modal = canvas.getByTestId('confirm-download-modal');
  expect(modal).toBeInTheDocument();
  expect(canvas.getByText('Download anyway')).toBeInTheDocument();
};

export const ConfirmationModalInteraction = Template.bind({});
ConfirmationModalInteraction.decorators = [box];
ConfirmationModalInteraction.args = ConfirmationModal.args;
ConfirmationModalInteraction.play = ({ args }) => {
  const modal = within(screen.getByTestId('confirm-download-modal'));
  const downloadButton = modal.getByText('Download anyway');
  userEvent.click(downloadButton);
  expect(args.onDownloadMatrix).toBeCalledWith(
    mockProcessConfigurations[0].bidProcessEventExternalId
  );
  expect(args.onChangeShowConfirmDownloadModal).toBeCalledWith(false);
  const closeButton = modal.getAllByRole('button', { hidden: true })[0];
  userEvent.click(closeButton);
  expect(args.onChangeShowConfirmDownloadModal).toBeCalledWith(false);
};

export const Interactions = Template.bind({});
Interactions.decorators = [box];
Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const downloadButton = canvas.getByText('Download');
  userEvent.click(downloadButton);
  expect(args.onDownloadButtonClick).toBeCalled();

  const methodSelector = canvas.getByText('Method:');
  userEvent.click(methodSelector);
  const newMethod = await canvas.findByText('Price independent');
  userEvent.click(newMethod);
  expect(args.onChangeProcessConfigurationExternalId).toBeCalledWith(
    mockProcessConfigurations[1].bidProcessEventExternalId
  );
};
