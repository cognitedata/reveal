/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  RevealContainer,
  RevealToolbar,
  useSearchReveal360ImageAnnotationAssets,
  Image360CollectionContainer,
  useReveal
} from '../src';
import { type AssetAnnotationImage360Info, type ImageAnnotationObject } from '@cognite/reveal';
import { Color } from 'three';
import { type ReactElement, useState, useMemo } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Button, Input } from '@cognite/cogs.js';
import { isEqual } from 'lodash';

const queryClient = new QueryClient();
const sdk = createSdkByUrlToken();

type Equipment = {
  view: string;
  externalId: string;
  space: string;
  properties?: Record<string, any>;
  image360Info: AssetAnnotationImage360Info;
};

const StoryContent = ({ siteId }: { siteId: string }): ReactElement => {
  const [resourcesLoaded, setResourcesLoaded] = useState<boolean>(false);
  const onLoad = (): void => {
    setResourcesLoaded((prev) => !prev);
  };
  return (
    <>
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <ReactQueryDevtools position="bottom-right" />
        <Image360CollectionContainer siteId={siteId} onLoad={onLoad} />
        <RevealToolbar />
        {resourcesLoaded && <RevealSearchContent />}
      </RevealContainer>
    </>
  );
};

function RevealSearchContent(): ReactElement {
  const [tempSearchQuery, setTempSearchQuery] = useState<string>('');
  const [mainSearchQuery, setMainSearchQuery] = useState<string>('');
  const reveal = useReveal();
  const [searchMethod, setSearchMethod] = useState<'allReveal360Assets' | 'reveal360AssetsSearch'>(
    'allReveal360Assets'
  );
  const { data: allAnnotationAssets, isFetched } =
    useSearchReveal360ImageAnnotationAssets(mainSearchQuery);

  const filteredEquipment = useMemo(() => {
    if (searchMethod === 'reveal360AssetsSearch') {
      if (allAnnotationAssets === undefined) {
        return [];
      }
      const filteredAssets =
        allAnnotationAssets.filter((revealAnnotationAsset) => {
          const isInName = revealAnnotationAsset.asset.name
            .toLowerCase()
            .includes(mainSearchQuery.toLowerCase());
          const isInDescription = revealAnnotationAsset.asset.description
            ?.toLowerCase()
            .includes(mainSearchQuery.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      const mappedAssets: Equipment[] = filteredAssets.map((revealAnnotationAsset) => {
        return {
          view: 'Asset',
          externalId: revealAnnotationAsset.asset.id + '',
          space: 'Whole project',
          properties: {
            name: revealAnnotationAsset.asset.name,
            description: revealAnnotationAsset.asset.description
          },
          image360Info: revealAnnotationAsset.assetAnnotationImage360Info
        };
      });

      return mappedAssets;
    } else if (searchMethod === 'allReveal360Assets') {
      if (allAnnotationAssets === undefined) {
        return [];
      }

      const searchedEquipment: Equipment[] = allAnnotationAssets.map((revealAnnotationAsset) => {
        return {
          view: 'Asset',
          externalId: revealAnnotationAsset.asset.id + '',
          space: 'Whole project',
          properties: {
            name: revealAnnotationAsset.asset.name,
            description: revealAnnotationAsset.asset.description
          },
          image360Info: revealAnnotationAsset.assetAnnotationImage360Info
        };
      });

      return searchedEquipment;
    } else {
      return [];
    }
  }, [mainSearchQuery, searchMethod, allAnnotationAssets, isFetched]);

  const showAnnotation = async (
    assetAnnotationImage360Info: AssetAnnotationImage360Info
  ): Promise<void> => {
    if (assetAnnotationImage360Info === undefined || reveal === undefined) {
      return;
    }

    try {
      await reveal.enter360Image(
        assetAnnotationImage360Info.imageEntity,
        assetAnnotationImage360Info.imageRevision
      );

      const annotations = await assetAnnotationImage360Info.imageRevision.getAnnotations();
      const foundAnnotation = annotations.find((annotation: ImageAnnotationObject) => {
        return annotation.id === assetAnnotationImage360Info.annotationId;
      });
      if (foundAnnotation !== undefined) {
        reveal.cameraManager.setCameraState({ target: foundAnnotation.getCenter() });
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <>
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
          type={searchMethod === 'allReveal360Assets' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('allReveal360Assets');
          }}>
          All asset mappings search
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
          <div
            key={equipment.externalId + index}
            style={{ border: '1px solid green' }}
            onClick={async (event: React.MouseEvent<HTMLDivElement>) => {
              event.preventDefault();
              await showAnnotation(equipment.image360Info).catch((error) => {
                console.warn(error);
              });
            }}>
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
}

const meta = {
  title: 'Example/RevealSearchHooks',
  component: StoryContent,
  tags: ['autodocs']
} satisfies Meta<typeof StoryContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    siteId: 'celanese1'
  },
  render: ({ siteId }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <StoryContent siteId={siteId} />
      </QueryClientProvider>
    );
  }
};

function determineViewFromQueryResultNodeItem(nodeItem: Equipment): string {
  const spacesToSearch = ['Whole project'];
  return findNonZeroProperty(nodeItem?.properties?.[spacesToSearch[0]]) ?? 'Unknown';
}

function findNonZeroProperty(properties?: Record<string, any>): string | undefined {
  return Object.keys(properties ?? {}).find((key) => !isEqual(properties?.[key], {}));
}
