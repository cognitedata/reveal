import { BrowserRouter } from 'react-router-dom';

import { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from '../../common/i18n/index';

import { PipelineList } from '.';
import { PipelineListProps } from './PipelineList';
import { pipelineListFix } from './pipelineListFix';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

const mockCogniteClient = new CogniteClient({
  appId: 'flexible-data-explorer',
  project: 'PROJECT',
  getToken: () => Promise.resolve('mock token'),
});

type PipelineListStoryArgs = PipelineListProps & {
  havePipelines: boolean;
  showPagination: boolean;
};

const meta: Meta<PipelineListStoryArgs> = {
  component: PipelineList,
  args: {
    isLoading: false,
    havePipelines: true,
    showPagination: true,
    pipelineList: pipelineListFix,
  },
  argTypes: {
    handleReRunPipeline: { action: 'handleReRunPipeline' },
    handleDuplicate: { action: 'handleDuplicate' },
    handleDeletePipeline: { action: 'handleDeletePipeline' },
  },
  render: ({ havePipelines, showPagination, pipelineList, ...args }) => {
    if (havePipelines) {
      if (!showPagination) {
        return (
          <PipelineList pipelineList={pipelineList.slice(0, 25)} {...args} />
        );
      }
      return <PipelineList pipelineList={pipelineList} {...args} />;
    }
    return <PipelineList pipelineList={[]} {...args} />;
  },
  decorators: [
    (story) => (
      <I18nWrapper
        translations={translations}
        defaultNamespace="entity-matching"
      >
        {story()}
      </I18nWrapper>
    ),
    (story) => (
      <QueryClientProvider client={queryClient}>
        <SDKProvider sdk={mockCogniteClient}>{story()}</SDKProvider>
      </QueryClientProvider>
    ),
    (story) => <BrowserRouter>{story()}</BrowserRouter>,
  ],
};

export default meta;

type Story = StoryObj<typeof PipelineList>;

export const PipelineListStory: Story = {};
