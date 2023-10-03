/**
 * SourceTable StoryBook
 */
import { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';

import { Meta, Story } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { ChartTimeSeries, ChartWorkflow } from '@cognite/charts-lib';
import { SDKProvider } from '@cognite/sdk-provider';

import { makeDefaultTranslations } from '../../utils/translations';
import { DatapointsSummary } from '../../utils/units';

import SourceTable from './SourceTable';

const queryClient = new QueryClient();

const defaultTranslation = makeDefaultTranslations(
  'Style',
  'Name',
  'Status',
  'Tag',
  'Description',
  'Min',
  'Max',
  'Mean',
  'Unit',
  'P&IDs',
  'Remove',
  'Info',
  'More'
);

export default {
  component: SourceTable,
  title: 'Components/Source Table/Table',
  decorators: [
    (story) => (
      <QueryClientProvider client={queryClient}>{story()}</QueryClientProvider>
    ),
    (story) => <SDKProvider sdk={sdk}>{story()}</SDKProvider>,
    (story) => <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>,
  ],
} as Meta;

const Template: Story<ComponentProps<typeof SourceTable>> = (args) => (
  <SourceTable {...args} headerTranslations={defaultTranslation} />
);

export const WorkspaceTable = Template.bind({});
export const EditorTable = Template.bind({});
export const FileTable = Template.bind({});

const sources: (ChartTimeSeries | ChartWorkflow)[] = [
  {
    id: 'ts-1',
    type: 'timeseries',
    name: 'Timeseries 1',
    description: 'TS 1',
    tsExternalId: 'ts-external-id-1',
    color: 'red',
    enabled: true,
  } as ChartTimeSeries,
  {
    id: 'ts-2',
    type: 'timeseries',
    name: 'Timeseries 2',
    description: 'TS 2',
    tsExternalId: 'ts-external-id-2',
    color: 'blue',
    enabled: false,
  } as ChartTimeSeries,
  {
    id: 'calc-1',
    type: 'workflow',
    name: 'Calculation 1',
    color: 'brown',
    enabled: true,
  } as ChartWorkflow,
  {
    id: 'calc-2',
    type: 'workflow',
    name: 'Calculation 2',
    color: 'magenta',
    enabled: false,
  } as ChartWorkflow,
];

const summaries: { [key: string]: DatapointsSummary } = {
  'ts-external-id-1': {
    min: 1,
    mean: 2,
    max: 3,
  },
  'ts-external-id-2': {
    min: 4,
    mean: 5,
    max: 6,
  },
  'calc-1': {
    min: 7,
    mean: 8,
    max: 9,
  },
  'calc-2': {
    min: 10,
    mean: 11,
    max: 12,
  },
};

WorkspaceTable.args = {
  mode: 'workspace',
  sources,
  summaries,
};
EditorTable.args = {
  mode: 'editor',
  sources,
  summaries,
};
FileTable.args = {
  mode: 'file',
  sources,
  summaries,
};
