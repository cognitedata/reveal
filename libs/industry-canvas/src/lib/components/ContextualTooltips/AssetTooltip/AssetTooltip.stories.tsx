import { Story } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CogniteClient, Asset, CursorAndAsyncIterator } from '@cognite/sdk';
import { Timeseries } from '@cognite/sdk/dist/src/index';
import { SDKProvider } from '@cognite/sdk-provider';

import AssetTooltip from './AssetTooltip';

export default {
  title: 'Components/Asset Tooltip Story',
  component: AssetTooltip,
};

const generateMockSdk = (timeseriesLimit: number) => {
  return {
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
          items: Array.from({ length: timeseriesLimit }).map((_ts, idx) => ({
            id: idx + 1,
            name: `SYSTEM_000${idx + 1}_21PT1019.Value`,
          })) as Timeseries[],
        };
      },
    },
  } as unknown as CogniteClient;
};

const queryClient = new QueryClient();

export const AssetTooltipStory: Story<{ timeseriesList: number }> = (args) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={generateMockSdk(args.timeseriesList)}>
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

AssetTooltipStory.args = {
  timeseriesList: 10,
};
