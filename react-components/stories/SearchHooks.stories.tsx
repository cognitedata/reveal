/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  type AddResourceOptions,
  type FdmAssetStylingGroup,
  useMappedEdgesForRevisions,
  AddReveal3DModelOptions
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { useSearchMappedEquipmentAssetMappings, useSearchMappedEquipmentFDM } from '../src/hooks/useSearchMappedEquipment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();
const sdk = createSdkByUrlToken();

type Equipment = {
    view: string;
    externalId: string;
    space: string;
    properties?: Record<string, any>;
}

const StoryContent = ({ resources }: { resources: AddResourceOptions[]}): ReactElement => {
    const [stylingGroups, setStylingGroups] = useState<FdmAssetStylingGroup[]>([]);
    const [mappedEquipment, setMappedEquipment] = useState<Equipment[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchHookEnabled, setIsSearchHookEnabled] = useState<boolean>(false);
  

  const filteredResources = resources.filter((resource): resource is AddReveal3DModelOptions => 'modelId' in resource);

    const { data: searchData } = useSearchMappedEquipmentFDM(searchQuery, ['fdx-boys'], 50, sdk);

  const { data, hasNextPage, isFetching, fetchNextPage } = useSearchMappedEquipmentAssetMappings(searchQuery, filteredResources, 50, sdk);

  useEffect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetching]);

  useEffect(() => {
    console.log('Current data', data);
  }, [data])

    
    const filteredEquipment = useMemo(() => {
      if (!isSearchHookEnabled) {
        return mappedEquipment.filter((equipment) => {
          return equipment.externalId.toLowerCase().includes(searchQuery.toLowerCase());
        });
      }

      if (searchData === undefined) {
        return [];
      }

      const searchedEquipment: Equipment[] = searchData.map((searchResult) => {
        return searchResult.instances.map((instance) => {
          return {
            view: searchResult.view.externalId,
            externalId: instance.externalId,
            space: instance.space,
            properties: instance.properties
          };
        });
      }).flat();

      return searchedEquipment;
    }, [searchQuery, mappedEquipment, searchData, isSearchHookEnabled])
  
    return (<>
        <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
            <ReactQueryDevtools position='bottom-right' />
            <RevealResourcesFitCameraOnLoad
                resources={resources}
                defaultResourceStyling={{
                    cad: {
                        default: { color: new Color('#efefef') },
                        mapped: { color: new Color('#c5cbff') }
                    }
                }}
                instanceStyling={stylingGroups}
            />
            <RevealToolbar />
            <MappedEquipmentHookHandler resources={filteredResources} setMappedEquipment={setMappedEquipment} />
        </RevealContainer>
        <h1>Mapped equipment</h1>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, padding: '0 8px 8px 0' }}>
            <input onInput={(event) => setSearchQuery((event.target as HTMLInputElement).value)}></input>
            <button onClick={() => { }}>Search</button>
            <button onClick={() => setIsSearchHookEnabled((prev) => !prev)}>Switch search hook</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, height: 200, overflow: 'scroll' }} >
            {filteredEquipment.map((equipment) => (
                <div key={equipment.externalId} style={{ border: '1px solid green' }}>
                    <b >{equipment.view + ' '}</b>
                    <span>{equipment.externalId + ' '}</span>
                    <span><b>Space:</b> {equipment.space + ' '}</span>
                {equipment.properties &&
                  Object.keys(equipment.properties).map((key) => {
                    return <span><b>{key}</b> {equipment?.properties?.[key] + ' '}</span>
                    })}
                </div>
            ))}
        </div>
    </>
    );
};

const MappedEquipmentHookHandler = ({ resources, setMappedEquipment}: { resources: AddReveal3DModelOptions[], setMappedEquipment: (mappedEquipment: Equipment[]) => void }) => {
    const { data } = useMappedEdgesForRevisions(resources, true);

    useEffect(() => {
        if (data === undefined) {
            console.log('Data is undefined');
            return
        }

        const mappedEquipment: Equipment [] = [];

        data.forEach((value, key) => {
            const currentModelEquipment = value.map((edge) => ({ view: edge.view?.externalId ?? 'None', externalId: edge.edge.startNode.externalId, space: edge.edge.startNode.space }));
            mappedEquipment.push(...currentModelEquipment);
        });

        setMappedEquipment(mappedEquipment);
    }, [data]);

    return <></>
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
        modelId: 3282558010084460,
        revisionId: 4932190516335812,
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        }
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
