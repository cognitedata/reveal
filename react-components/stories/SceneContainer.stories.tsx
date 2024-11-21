/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { SceneContainer } from '../src/components/SceneContainer/SceneContainer';
import { Color } from 'three';
import { useEffect, type ReactElement, useState, useCallback, useMemo } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import {
  type AddCadResourceOptions,
  type AddImage360CollectionOptions,
  type AddPointCloudResourceOptions,
  type DefaultResourceStyling,
  type DmsUniqueIdentifier,
  RevealToolbar,
  useAllAssetsMapped360Annotations,
  useAllAssetsMappedPointCloudAnnotations,
  useAllMappedEquipmentAssetMappings,
  useAllMappedEquipmentFDM,
  useReveal,
  useReveal3dResourcesFromScene,
  useSceneDefaultCamera,
  useSearchAssetsMapped360Annotations,
  useSearchAssetsMappedPointCloudAnnotations,
  useSearchMappedEquipmentAssetMappings,
  useSearchMappedEquipmentFDM,
  withSuppressRevealEvents
} from '../src';
import { Button, Input, ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { type AddModelOptions } from '@cognite/reveal';
import { is360ImageAddOptions } from '../src/components/Reveal3DResources/typeGuards';
import { isEqual } from 'lodash';
import { type NodeItem } from '../src/data-providers/FdmSDK';

const meta = {
  title: 'Example/PrimitiveWrappers/SceneContainer',
  component: SceneContainer,
  tags: ['autodocs']
} satisfies Meta<typeof SceneContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

const viewsToSearch = [
  { externalId: 'CognitePointCloudVolume', space: 'cdf_cdm', version: 'v1', type: 'view' }
];

type Equipment = {
  view: string;
  externalId: string;
  space: string;
  properties?: Record<string, any>;
};

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute !important;
  right: 20px;
  top: 70px;
`;

export const Main: Story = {
  args: {
    sceneExternalId: '92748157-a77e-4163-baa0-64886edad458',
    sceneSpaceId: 'test3d',
    defaultResourceStyling: {
      pointcloud: {
        default: {
          color: new Color('#efefef')
        },
        mapped: {
          color: new Color('#c5cbff')
        }
      }
    }
  },
  render: ({
    sceneExternalId,
    sceneSpaceId,
    defaultResourceStyling
  }: {
    sceneExternalId: string;
    sceneSpaceId: string;
    defaultResourceStyling?: DefaultResourceStyling;
  }) => {
    const [selectedScene, setSelectedScene] = useState<DmsUniqueIdentifier | undefined>(undefined);
    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)} sdk={sdk} useCoreDm>
        <MyCustomToolbar>
          <RevealToolbar.ResetCameraButton
            sceneExternalId={selectedScene?.externalId}
            sceneSpaceId={selectedScene?.space}
          />
          <RevealToolbar.SelectSceneButton
            selectedScene={selectedScene}
            setSelectedScene={setSelectedScene}
          />
          <RevealToolbar.FitModelsButton />
        </MyCustomToolbar>
        <SceneContainerStoryContent
          sceneExternalId={
            selectedScene !== undefined ? selectedScene?.externalId : sceneExternalId
          }
          sceneSpaceId={selectedScene !== undefined ? selectedScene?.space : sceneSpaceId}
          defaultResourceStyling={defaultResourceStyling}
        />
      </RevealStoryContainer>
    );
  }
};

type SceneContainerStoryContentProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
  defaultResourceStyling?: DefaultResourceStyling;
};

const SceneContainerStoryContent = ({
  sceneExternalId,
  sceneSpaceId,
  defaultResourceStyling
}: SceneContainerStoryContentProps): ReactElement => {
  const reveal = useReveal();
  const { fitCameraToSceneDefault } = useSceneDefaultCamera(sceneExternalId, sceneSpaceId);
  const resources = useReveal3dResourcesFromScene(sceneExternalId, sceneSpaceId);

  const [tempSearchQuery, setTempSearchQuery] = useState<string>('');
  const [mainSearchQuery, setMainSearchQuery] = useState<string>('');
  const [searchMethod, setSearchMethod] = useState<
    'allFdm' | 'allAssets' | 'fdmSearch' | 'assetSearch'
  >('allFdm');

  useEffect(() => {
    fitCameraToSceneDefault();
  }, [reveal, fitCameraToSceneDefault]);

  const filteredResources = resources.filter(
    (resource): resource is AddCadResourceOptions | AddPointCloudResourceOptions =>
      !is360ImageAddOptions(resource)
  );

  const { data: searchData } = useSearchMappedEquipmentFDM(
    mainSearchQuery,
    viewsToSearch,
    filteredResources as AddModelOptions[],
    undefined,
    100
  );

  const {
    data: assetSearchData,
    isFetching: isAssetSearchFetching,
    hasNextPage: assetSearchHasNextPage,
    fetchNextPage: fetchAssetSearchNextPage
  } = useSearchMappedEquipmentAssetMappings(
    mainSearchQuery,
    filteredResources as AddModelOptions[],
    1000,
    sdk
  );

  const { data: allEquipment } = useAllMappedEquipmentFDM(
    filteredResources as AddModelOptions[],
    viewsToSearch
  );


  const {
    data: allAssets,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(filteredResources as AddModelOptions[], sdk, 25);

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
    filteredResources as AddModelOptions[],
    sdk,
    mainSearchQuery
  );

  const { data: allPointCloudAssets } = useAllAssetsMappedPointCloudAnnotations(
    sdk,
    filteredResources as AddModelOptions[]
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
      <SceneContainer
        sceneExternalId={sceneExternalId}
        sceneSpaceId={sceneSpaceId}
        defaultResourceStyling={defaultResourceStyling}
      />
      <h1>Mapped equipment</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, padding: '0 8px 8px 0' }}>
        <Input
          onInput={(event: any) => {
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

function determineViewFromQueryResultNodeItem(nodeItem: NodeItem | Equipment): string {
  return findNonZeroProperty(nodeItem?.properties) ?? 'Unknown';
}

function findNonZeroProperty(properties?: Record<string, any>): string | undefined {
  return Object.keys(properties ?? {}).find((key) => !isEqual(properties?.[key], {}));
}
