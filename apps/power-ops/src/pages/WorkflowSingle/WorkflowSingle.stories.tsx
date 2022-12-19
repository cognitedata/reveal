import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { authDecorator, reactQueryDecorator } from 'utils/test/storyDecorators';

import { WorkflowSingle } from './WorkflowSingle';

export default {
  component: WorkflowSingle,
  title: 'Pages/Single Workflow',
  decorators: [authDecorator(), reactQueryDecorator],
  argTypes: {
    handleBackButtonClick: { action: 'Clicked back button' },
    onShowMetadata: { action: 'Expand/collapse metadata' },
  },
  args: {
    workflowEvent: {
      externalId: 'Test_External_ID',
      endTime: 1671017297835,
      type: 'Test_Workflow_Type',
      metadata: {
        'shop:endtime': '2022-12-25 23:00:00',
        'shop:starttime': '2022-12-14 23:00:00',
        'bid:price_area': 'price_area_NO3',
        'bid:date': '2022-12-15',
      },
      id: 1,
      lastUpdatedTime: '2022-12-14T11:28:17.872Z',
      createdTime: '2022-12-14T11:00:33.881Z',
    },
    duration: '0:01:10',
    workflowMetadata: [
      {
        id: 'shop:endtime',
        key: 'shop:endtime',
        value: '2022-12-25 23:00:00',
      },
      {
        id: 'shop:starttime',
        key: 'shop:starttime',
        value: '2022-12-14 23:00:00',
      },
      {
        id: 'bid:price_area',
        key: 'bid:price_area',
        value: 'price_area_NO3',
      },
      {
        id: 'bid:date',
        key: 'bid:date',
        value: '2022-12-15',
      },
    ],
    processes: [
      {
        id: 1,
        cdfProject: 'Test-project',
        eventExternalId: 'Test_Event_1_External_ID',
        eventType: 'POWEROPS_PROCESS_FAILED',
        eventCreationTime: '2022-12-14T11:28:06.066Z',
        eventStartTime: '2022-12-14T11:28:09.395Z',
        eventEndTime: '2022-12-14T11:28:15.772Z',
        status: 'FAILED',
      },
      {
        id: 2,
        cdfProject: 'Test-project',
        eventExternalId: 'Test_Event_2_External_ID',
        eventType: 'POWEROPS_PROCESS_FINISHED',
        eventCreationTime: '2022-12-14T11:28:04.183Z',
        eventStartTime: null,
        eventEndTime: '2022-12-14T11:28:16.743Z',
        status: 'FINISHED',
      },
    ],
    showMetadata: false,
  },
} as Meta;

const Template: Story<ComponentProps<typeof WorkflowSingle>> = (args) => {
  return <WorkflowSingle {...args} />;
};

export const Default = Template.bind({});

export const Interactions = Template.bind({});

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  // Test back button
  const backButton = canvas.getByTestId('back-button');
  await userEvent.click(backButton);
  expect(args.handleBackButtonClick).toBeCalled();

  // Test metadata
  const expandMetadata = canvas.getByTestId('metadata');
  await userEvent.click(expandMetadata);
  expect(await canvas.findByText('shop:endtime')).toBeInTheDocument();
};
