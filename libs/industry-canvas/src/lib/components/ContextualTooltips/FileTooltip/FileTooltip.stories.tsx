import { QueryClient, QueryClientProvider } from 'react-query';

import { SDKProvider } from '@cognite/sdk-provider';
import { FileInfo, CogniteClient } from '@cognite/sdk';
import { ComponentStory } from '@storybook/react';
import FileTooltip from './FileTooltip';

export default {
  title: 'Components/File Tooltip Story',
  component: FileTooltip,
};

const mockSdk = {
  files: {
    retrieve: async (input: { id: number }[]): Promise<FileInfo[]> => {
      if (input[0].id === 111) {
        return [
          {
            id: 111,
            name: '15_9_19_A_1997_07_25.pdf',
            externalId: '15_9_19_A_1997_07_25.pdf',
          },
        ] as FileInfo[];
      }

      return [
        {
          id: 222,
          name: 'Test.pdf',
          externalId: 'Test.pdf',
        },
      ] as FileInfo[];
    },
  },
} as unknown as CogniteClient;

const queryClient = new QueryClient();

export const FileTooltipLongStory: ComponentStory<typeof FileTooltip> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={mockSdk}>
        <FileTooltip
          id={111}
          onAddFileClick={() => console.log('onAddFileClick')}
          onViewClick={() => console.log('onViewClick')}
        />
      </SDKProvider>
    </QueryClientProvider>
  );
};

export const FileTooltipShortStory: ComponentStory<typeof FileTooltip> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={mockSdk}>
        <FileTooltip
          id={222}
          onAddFileClick={() => console.log('onAddFileClick')}
          onViewClick={() => console.log('onViewClick')}
        />
      </SDKProvider>
    </QueryClientProvider>
  );
};
