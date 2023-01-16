import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { authDecorator, reactQueryDecorator } from 'utils/test/storyDecorators';
import { MemoryRouter } from 'react-router-dom-v5';
import { EVENT_STATUSES } from 'utils/utils';

import { Workflows } from './Workflows';

export default {
  component: Workflows,
  title: 'Pages/Workflows',
  decorators: [
    authDecorator(),
    reactQueryDecorator,
    (Story) => {
      return (
        // For useRouteMatch and useHistory
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
  argTypes: {
    onWorkflowTypeValueChanged: {
      action: 'Changed Workflow Type filter value',
    },
    onStatusValueChanged: { action: 'Changed Status filter value' },
    onSearchQueryValueChanged: { action: 'Change search query value' },
  },
  args: {
    workflowTypes: [
      {
        label: 'Test workflow type 1',
        value: 'Test workflow type 1',
      },
      {
        label: 'Test workflow type 2',
        values: 'Test workflow type 2',
      },
    ],
    selectedWorkflowTypes: [
      {
        label: 'test_workflow_type_1',
        value: 'Test workflow type 1',
      },
    ],
    workflowStatuses: EVENT_STATUSES.map((status: string) => ({
      label: status,
      value: status,
    })),
    selectedWorkflowStatuses: [
      {
        value: 'Failed',
        label: 'failed',
      },
    ],
    workflows: [
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
  },
} as Meta;

const Template: Story<ComponentProps<typeof Workflows>> = (args) => {
  return <Workflows {...args} />;
};

export const Default = Template.bind({});

export const Interactions = Template.bind({});

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  // Test select workflow type filter value
  const workflowTypeFilter = await canvas.findByText('Workflow type:');
  await userEvent.click(workflowTypeFilter);
  const workflowType = await canvas.findByText('Test workflow type 2');
  await userEvent.click(workflowType);
  expect(args.onWorkflowTypeValueChanged).toBeCalled();

  // Test select status filter value
  const statusFilter = await canvas.findByText('Status:');
  await userEvent.click(statusFilter);
  const status = await canvas.findByText('Running');
  await userEvent.click(status);
  expect(args.onStatusValueChanged).toBeCalled();

  // Test search query value
  const search = await canvas.findByRole('searchbox');
  await userEvent.type(search, 'test query');
  expect(args.onSearchQueryValueChanged).toBeCalled();
};
