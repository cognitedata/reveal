/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealCanvas,
  RevealToolbar,
  type AddResourceOptions,
  type AddImage360CollectionOptions,
  RevealContext,
  type AddCadResourceOptions,
  type AddPointCloudResourceOptions
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useMemo, useCallback } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import {
  useAllMappedEquipmentFDM,
  useSearchMappedEquipmentFDM
} from '../src/query/useSearchMappedEquipmentFDM';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAllMappedEquipmentAssetMappings,
  useSearchMappedEquipmentAssetMappings
} from '../src/query/useSearchMappedEquipmentAssetMappings';
import {
  useAllAssetsMapped360Annotations,
  useSearchAssetsMapped360Annotations
} from '../src/query/useSearchAssetsMapped360Annotations';
import {
  useAllAssetsMappedPointCloudAnnotations,
  useSearchAssetsMappedPointCloudAnnotations
} from '../src/query/useSearchAssetsMappedPointCloudAnnotations';
import { isEqual } from 'lodash';
import { type NodeItem } from '../src/data-providers/FdmSDK';
import { Button, Input } from '@cognite/cogs.js';
import { is360ImageAddOptions } from '../src/components/Reveal3DResources/typeGuards';

const queryClient = new QueryClient();
const sdk = createSdkByUrlToken();
const viewsToSearch = [
  { externalId: 'Equipment', space: 'fdx-boys', version: 'e040583320d31a' },
  { externalId: 'WorkOrderMultiple', space: 'fdx-boys', version: 'e040583320d31a' },
  { externalId: 'WorkOrderSingle', space: 'fdx-boys', version: 'e040583320d31a' }
];

type Equipment = {
  view: string;
  externalId: string;
  space: string;
  properties?: Record<string, any>;
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [tempSearchQuery, setTempSearchQuery] = useState<string>('');
  const [mainSearchQuery, setMainSearchQuery] = useState<string>('');
  const [searchMethod, setSearchMethod] = useState<
    'allFdm' | 'allAssets' | 'fdmSearch' | 'assetSearch'
  >('assetSearch');

  const filteredResources = resources.filter(
    (resource): resource is AddCadResourceOptions | AddPointCloudResourceOptions =>
      !is360ImageAddOptions(resource)
  );

  const { data: searchData } = useSearchMappedEquipmentFDM(
    mainSearchQuery,
    viewsToSearch,
    filteredResources,
    undefined,
    100
  );

  const {
    data: assetSearchData,
    isFetching: isAssetSearchFetching,
    hasNextPage: assetSearchHasNextPage,
    fetchNextPage: fetchAssetSearchNextPage
  } = useSearchMappedEquipmentAssetMappings(mainSearchQuery, filteredResources, 1000, sdk);

  const { data: allEquipment } = useAllMappedEquipmentFDM(filteredResources, viewsToSearch);

  const {
    data: allAssets,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(filteredResources, sdk, 25);

  const filtered360ImageResources = resources.filter(
    (resource): resource is AddImage360CollectionOptions => 'siteId' in resource
  );
  const siteIds = filtered360ImageResources.map((filteredResource) => {
    return 'siteId' in filteredResource ? filteredResource.siteId : filteredResource.externalId;
  });

  const { data: assetAnnotationImage360SearchData } = useSearchAssetsMapped360Annotations(
    siteIds,
    sdk,
    mainSearchQuery
  );

  const { data: all360ImageAssetAnnotationMappings } = useAllAssetsMapped360Annotations(
    sdk,
    siteIds
  );

  const { data: pointCloudAssetSearchData } = useSearchAssetsMappedPointCloudAnnotations(
    filteredResources,
    sdk,
    mainSearchQuery
  );

  const { data: allPointCloudAssets } = useAllAssetsMappedPointCloudAnnotations(
    sdk,
    filteredResources
  );

  const fetchNextPageCallback = useCallback(() => {
    if (searchMethod !== 'allAssets' && searchMethod !== 'assetSearch') return;
    if (searchMethod === 'allAssets' && !isFetching && hasNextPage) {
      void fetchNextPage();
    } else if (searchMethod === 'assetSearch' && !isAssetSearchFetching && assetSearchHasNextPage) {
      void fetchAssetSearchNextPage();
    }
  }, [
    searchMethod,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isAssetSearchFetching,
    assetSearchHasNextPage,
    fetchAssetSearchNextPage
  ]);

  const filteredEquipment = useMemo(() => {
    if (searchMethod === 'allFdm') {
      return (
        allEquipment?.filter((equipment) => {
          const isInExternalId = equipment.externalId
            .toLowerCase()
            .includes(mainSearchQuery.toLowerCase());
          const isInProperties = Object.values(equipment.properties).some((viewProperties) =>
            Object.values(viewProperties).some((property) =>
              Object.values(property).some((value) => {
                const valueAsString =
                  typeof value === 'object' ? (value as any)?.externalId : value?.toString();
                return valueAsString?.toLowerCase().includes(mainSearchQuery.toLowerCase());
              })
            )
          );

          return isInExternalId || isInProperties;
        }) ?? []
      );
    } else if (searchMethod === 'allAssets') {
      const transformedAssets =
        allAssets?.pages
          .flat()
          .map((mapping) => mapping.assets)
          .flat() ?? [];

      const all360ImageAssets =
        all360ImageAssetAnnotationMappings?.map((mapping) => mapping.asset) ?? [];
      const combinedAssets = [
        ...transformedAssets,
        ...(all360ImageAssets ?? []),
        ...(allPointCloudAssets ?? [])
      ];

      const filteredAssets =
        combinedAssets.filter((assetMappings) => {
          const isInName = assetMappings.name.toLowerCase().includes(mainSearchQuery.toLowerCase());
          const isInDescription = assetMappings.description
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
    } else if (searchMethod === 'assetSearch') {
      if (assetSearchData === undefined) {
        return [];
      }

      const transformedAssetsSearch = assetSearchData?.pages
        .flat()
        .map((mapping) => mapping.assets)
        .flat();

      const assetImage360SearchData =
        assetAnnotationImage360SearchData?.map((mapping) => mapping.asset) ?? [];

      const combinedAssetSearchData = [
        ...transformedAssetsSearch,
        ...(assetImage360SearchData ?? []),
        ...(pointCloudAssetSearchData ?? [])
      ];

      const searchedEquipment: Equipment[] = combinedAssetSearchData.map((asset) => {
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
    } else if (searchMethod === 'fdmSearch') {
      if (searchData === undefined) {
        return [];
      }

      const searchedEquipment: Equipment[] = searchData
        .map((searchResult) => {
          return searchResult.instances.map((instance) => {
            return {
              view: searchResult.view.externalId,
              externalId: instance.externalId,
              space: instance.space,
              properties: instance.properties
            };
          });
        })
        .flat();

      return searchedEquipment;
    } else {
      return [];
    }
  }, [
    mainSearchQuery,
    allEquipment,
    searchData,
    allAssets,
    all360ImageAssetAnnotationMappings,
    assetSearchData,
    assetAnnotationImage360SearchData,
    searchMethod
  ]);

  return (
    <>
      <RevealCanvas>
        <ReactQueryDevtools buttonPosition="bottom-right" />
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
      </RevealCanvas>
      <h1>Mapped equipment</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, padding: '0 8px 8px 0' }}>
        <Input
          onInput={(event) => {
            setTempSearchQuery((event.target as HTMLInputElement).value);
          }}></Input>
        <Button
          size="small"
          onClick={() => {
            setMainSearchQuery(tempSearchQuery);
          }}>
          Search
        </Button>
        <Button
          size="small"
          type={searchMethod === 'allFdm' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('allFdm');
          }}>
          All FDM mappings search
        </Button>
        <Button
          size="small"
          type={searchMethod === 'fdmSearch' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('fdmSearch');
          }}>
          FDM search hook
        </Button>
        <Button
          size="small"
          type={searchMethod === 'allAssets' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('allAssets');
          }}>
          All asset mappings search
        </Button>
        <Button
          size="small"
          type={searchMethod === 'assetSearch' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('assetSearch');
          }}>
          Asset search hook
        </Button>
        <Button
          size="small"
          loading={isFetching || isAssetSearchFetching}
          onClick={fetchNextPageCallback}>
          Load More
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: 200,
          overflow: 'scroll'
        }}>
        {filteredEquipment.map((equipment, index) => (
          <div key={equipment.externalId + index} style={{ border: '1px solid green' }}>
            <b>
              {((equipment as Equipment)?.view ?? determineViewFromQueryResultNodeItem(equipment)) +
                ' '}
            </b>
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
  title: 'Example/SearchHooks',
  component: StoryContent,
  tags: ['autodocs']
} satisfies Meta<typeof StoryContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 3544114490298106,
        revisionId: 6405404576933316,
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        },
        siteId: 'celanese1'
      },
      {
        modelId: 7646043527629245,
        revisionId: 6059566106376463
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
        <QueryClientProvider client={queryClient}>
          <StoryContent resources={resources} />
        </QueryClientProvider>
      </RevealContext>
    );
  }
};

function determineViewFromQueryResultNodeItem(nodeItem: NodeItem | Equipment): string {
  return findNonZeroProperty(nodeItem?.properties) ?? 'Unknown';
}

function findNonZeroProperty(properties?: Record<string, any>): string | undefined {
  return Object.keys(properties ?? {}).find((key) => !isEqual(properties?.[key], {}));
}
