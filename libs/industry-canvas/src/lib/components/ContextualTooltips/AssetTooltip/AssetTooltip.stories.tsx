import { ComponentStory } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CogniteClient, Asset, CursorAndAsyncIterator } from '@cognite/sdk';
import { Timeseries } from '@cognite/sdk/dist/src/index';
import { SDKProvider } from '@cognite/sdk-provider';

import AssetTooltip from './AssetTooltip';

export default {
  title: 'Components/Asset Tooltip Story',
  component: AssetTooltip,
};

const mockSdk = {
  assets: {
    retrieve: async (): Promise<Asset[]> => {
      return [
        {
          id: 111,
          name: '21PT1019',
          description:
            'NPS10 DOUBLE EXP GATE VALVE , CLASS 600, PER DATASHEET GTD70J-IA',
        },
      ] as Asset[];
    },
  },
  timeseries: {
    list: async (): Promise<CursorAndAsyncIterator<Timeseries>> => {
      return {
        items: [
          {
            id: 222,
            name: 'SYSTEM_021_21PT1019.Value',
          },
          {
            id: 333,
            name: 'LOR_NORWAY_SYSTEM_021_FO96176-02.Value\n',
          },
          {
            id: 444,
            name: 'SYSTEM_021_21PT1019.Value',
          },
        ] as Timeseries[],
      };
    },
  },
} as unknown as CogniteClient;

const queryClient = new QueryClient();

export const AssetTooltipStory: ComponentStory<typeof AssetTooltip> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={mockSdk}>
        <AssetTooltip
          id={123456}
          onAddTimeseries={(timeseriesId) =>
            console.log('onAddTimeseries', { timeseriesId })
          }
          onAddAsset={() => console.log('onAddAsset')}
          onAddThreeD={() => console.log('onAddThreeD')}
          onViewAsset={() => console.log('onViewAsset')}
        />
      </SDKProvider>
    </QueryClientProvider>
  );
};
