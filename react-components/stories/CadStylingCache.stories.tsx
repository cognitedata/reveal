/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  type CadModelStyling,
  RevealCanvas,
  useReveal,
  RevealContext,
  Reveal3DResources,
  Reveal3DResourcesProps
} from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { type CogniteCadModel, DefaultNodeAppearance } from '@cognite/reveal';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { useFdmMappedEdgesForRevisions } from '../src/components/CacheProvider/NodeCacheProvider';
import {
  CadModelOptions,
  DefaultResourceStyling,
  InstanceStylingGroup
} from '../src/components/Reveal3DResources/types';
import { NodeStylingGroup } from '../src/components/Reveal3DResources/applyCadStyling';

const meta = {
  title: 'Example/CadStylingCache',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 2231774635735416,
        revisionId: 912809199849811,
        styling: {},
        transform: new Matrix4().makeTranslation(0, 10, 0)
      }
    ]
  },
  render: ({ resources }) => (
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
      <RevealCanvas>
        <Models addOptions={resources[0] as CadModelOptions} />
      </RevealCanvas>
    </RevealContext>
  )
};

const Models = ({ addOptions }: { addOptions: CadModelOptions }): JSX.Element => {
  const viewer = useReveal();

  const [platformStyling, setPlatformStyling] = useState<{
    instanceStyling: InstanceStylingGroup[];
    defaultStyling: DefaultResourceStyling;
  }>();

  const { data } = useFdmMappedEdgesForRevisions([addOptions]);

  const instanceIds = useMemo(
    () =>
      data
        ?.get(`${addOptions.modelId}/${addOptions.revisionId}`)
        ?.map((edgeWithNode) => edgeWithNode.edge.startNode) ?? [],
    [data]
  );

  useEffect(() => {
    const callback = (): void => {
      if (platformStyling === undefined) return;

      setPlatformStyling((prev) => {
        if (prev === undefined) return prev;

        const newInstanceIds = getRandomSubset(instanceIds, instanceIds.length * 0.8);

        return {
          ...prev,
          instanceStyling: [
            ...prev.instanceStyling,
            {
              fdmAssetExternalIds: newInstanceIds.slice(0, newInstanceIds.length / 2),
              style: {
                cad: {
                  color: new Color().setFromVector3(
                    new Vector3(Math.random(), Math.random(), Math.random())
                  ),
                  prioritizedForLoadingHint: 5
                }
              }
            }
          ]
        };
      });
    };
    useEffect(() => {
      if (instanceIds === undefined) return;
    }, [viewer, data]);

    viewer.on('click', callback);
    return () => {
      viewer.off('click', callback);
    };
  }, [viewer, platformStyling, setPlatformStyling]);

  const onModelLoaded = (): void => {
    viewer.fitCameraToModel(viewer.models[0]);
  };

  return (
    <>
      <Reveal3DResources
        resources={[{ ...addOptions }]}
        instanceStyling={platformStyling?.instanceStyling}
        defaultResourceStyling={platformStyling?.defaultStyling}
        onResourcesAdded={onModelLoaded}
      />
    </>
  );
};

function getRandomSubset<T>(array: T[], size: number): T[] {
  const subset: T[] = [];

  for (let i = 0; i < size; i++) {
    const index = Math.floor(Math.random() * array.length);

    subset.push(array[index]);
  }

  return subset;
}
