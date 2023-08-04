import { useState } from 'react';

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
    get: async () => {
      // Used by 3D Button
      // /api/v1/projects/${getProject()}/3d/mappings/${assetId}/modelnodes
      return {
        data: {
          items: [],
          nextCursor: undefined,
        },
      };
    },
  } as unknown as CogniteClient;
};

const queryClient = new QueryClient();

export const AssetTooltipStory: Story<{ timeseriesList: number }> = (args) => {
  const [pinnedTimeseriesIds, setPinnedTimeseriesIds] = useState<number[]>([]);
  const onPinTimeseriesClick = (timeseriesId: number) => {
    console.log('onPinTimeseriesClick', timeseriesId);
    setPinnedTimeseriesIds((prevPinnedTimeseriesIds) =>
      prevPinnedTimeseriesIds.includes(timeseriesId) ? [] : [timeseriesId]
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={generateMockSdk(args.timeseriesList)}>
        <AssetTooltip
          id={123456}
          pinnedTimeseriesIds={pinnedTimeseriesIds}
          onPinTimeseriesClick={onPinTimeseriesClick}
          onAddTimeseries={(timeseriesId) =>
            console.log('onAddTimeseries', { timeseriesId })
          }
          onAddAsset={() => console.log('onAddAsset')}
          onAddThreeD={() => console.log('onAddThreeD')}
          onViewAsset={() => console.log('onViewAsset')}
          onOpenAssetInResourceSelector={() =>
            console.log('onOpenAssetInResourceSelector')
          }
          onOpenTimeseriesTabInResourceSelector={() => {
            console.log('onOpenTimeseriesTabInResourceSelector');
          }}
          onSetConditionalFormattingClick={() =>
            console.log('onSetConditionalFormattingClick')
          }
        />
      </SDKProvider>
    </QueryClientProvider>
  );
};

AssetTooltipStory.args = {
  timeseriesList: 10,
};
