/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  type AddResourceOptions,
  type AddImageCollection360Options
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useMemo } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import {
  useAllAssetsMapped360Annotations,
  useSearchAssetsMapped360Annotations
} from '../src/hooks/useSearchAssetsMapped360Annotations';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isEqual } from 'lodash';

const queryClient = new QueryClient();
const sdk = createSdkByUrlToken();

type Equipment = {
  view: string;
  externalId: string;
  space: string;
  properties?: Record<string, any>;
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [tempSearchQuery, setTempSearchQuery] = useState<string>('');
  const [mainSearchQuery, setMainSearchQuery] = useState<string>('');
  const [searchMethod, setSearchMethod] = useState<'allAnnotationAssets' | 'annotationAssetSearch'>(
    'allAnnotationAssets'
  );

  const filteredResources = resources.filter(
    (resource): resource is AddImageCollection360Options => 'siteId' in resource
  );
  const siteIds = filteredResources.map((filteredResource) => {
    return filteredResource.siteId;
  });

  const { data: assetSearchData } = useSearchAssetsMapped360Annotations(
    siteIds,
    sdk,
    mainSearchQuery
  );

  const { data: allAssets } = useAllAssetsMapped360Annotations(sdk, siteIds);

  const filteredEquipment = useMemo(() => {
    if (searchMethod === 'allAnnotationAssets') {
      const transformedAssets = allAssets?.flat() ?? [];

      const filteredAssets =
        transformedAssets.filter((asset) => {
          const isInName = asset.name.toLowerCase().includes(mainSearchQuery.toLowerCase());
          const isInDescription = asset.description
            ?.toLowerCase()
            .includes(mainSearchQuery.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      const mappedAssets: Equipment[] = filteredAssets.map((asset) => {
        return {
          view: 'Asset',
          externalId: asset.id + '',
          space: 'Whole project',
          properties: {
            name: asset.name,
            description: asset.description
          }
        };
      });

      return mappedAssets;
    } else if (searchMethod === 'annotationAssetSearch') {
      if (assetSearchData === undefined) {
        return [];
      }

      const searchedEquipment: Equipment[] = assetSearchData.map((asset) => {
        return {
          view: 'Asset',
          externalId: asset.id + '',
          space: 'Whole project',
          properties: {
            name: asset.name,
            description: asset.description
          }
        };
      });

      return searchedEquipment;
    } else {
      return [];
    }
  }, [mainSearchQuery, allAssets, assetSearchData, searchMethod]);

  return (
    <>
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <ReactQueryDevtools position="bottom-right" />
        <RevealResourcesFitCameraOnLoad
          resources={resources}
          defaultResourceStyling={{
            cad: {
              default: { color: new Color('#efefef') },
              mapped: { color: new Color('#c5cbff') }
            }
          }}
        />
        <RevealToolbar />
      </RevealContainer>
      <h1>Mapped Annotation</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, padding: '0 8px 8px 0' }}>
        <input
          onInput={(event) => {
            setTempSearchQuery((event.target as HTMLInputElement).value);
          }}></input>
        <button
          onClick={() => {
            setMainSearchQuery(tempSearchQuery);
          }}>
          Search
        </button>
        <button
          onClick={() => {
            setSearchMethod('allAnnotationAssets');
          }}>
          All annotation asset mappings
        </button>
        <button
          onClick={() => {
            setSearchMethod('annotationAssetSearch');
          }}>
          Annotation asset search hook
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: 200,
          overflow: 'scroll'
        }}>
        {filteredEquipment.map((equipment) => (
          <div key={equipment.externalId} style={{ border: '1px solid green' }}>
            <b>{(equipment?.view ?? determineViewFromQueryResultNodeItem(equipment)) + ' '}</b>
            <span>{equipment.externalId + ' '}</span>
            <span>
              <b>Space:</b> {equipment.space + ' '}
            </span>
            {equipment.properties !== undefined && JSON.stringify(equipment.properties)}
          </div>
        ))}
      </div>
    </>
  );
};

const meta = {
  title: 'Example/AnnotationSearchHooks',
  component: StoryContent,
  tags: ['autodocs']
} satisfies Meta<typeof StoryContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    resources: [
      {
        siteId: 'celanese1'
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <StoryContent resources={resources} />
      </QueryClientProvider>
    );
  }
};

function determineViewFromQueryResultNodeItem(nodeItem: Equipment): string {
  return findNonZeroProperty(nodeItem?.properties?.[0]) ?? 'Unknown';
}

function findNonZeroProperty(properties?: Record<string, any>): string | undefined {
  return Object.keys(properties ?? {}).find((key) => !isEqual(properties?.[key], {}));
}
