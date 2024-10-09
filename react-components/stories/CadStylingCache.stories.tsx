/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  type CadModelStyling,
  type CogniteCadModelProps,
  RevealCanvas,
  useReveal,
  RevealContext,
  type TreeIndexStylingGroup
} from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import {
  type AddModelOptions,
  type CogniteCadModel,
  DefaultNodeAppearance,
  IndexSet
} from '@cognite/reveal';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { useMappedEdgesForRevisions } from '../src/components/CacheProvider/NodeCacheProvider';

const meta = {
  title: 'Example/CadStylingCache',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 2231774635735416,
      revisionId: 912809199849811
    },
    styling: {},
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({
    addModelOptions,
    transform,
    styling
  }: {
    addModelOptions: AddModelOptions;
    transform?: Matrix4;
    styling?: CadModelStyling;
  }) => (
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
      <RevealCanvas>
        <Models addModelOptions={addModelOptions} styling={styling} transform={transform} />
      </RevealCanvas>
    </RevealContext>
  )
};

const Models = ({ addModelOptions }: CogniteCadModelProps): JSX.Element => {
  const platformModelOptions = addModelOptions;

  const viewer = useReveal();

  const [platformStyling, setPlatformStyling] = useState<CadModelStyling>();

  const { data } = useMappedEdgesForRevisions([platformModelOptions]);

  const treeIndices = useMemo(
    () =>
      data
        ?.get(`${platformModelOptions.modelId}/${platformModelOptions.revisionId}`)
        ?.map((edgeWithNode) => edgeWithNode.connection.treeIndex),
    [data]
  );

  useEffect(() => {
    const callback = (): void => {
      if (platformStyling === undefined || treeIndices === undefined) return;

      setPlatformStyling((prev): CadModelStyling | undefined => {
        if (prev?.groups === undefined) return prev;

        const newTreeIndices = getRandomSubset(treeIndices, treeIndices.length * 0.4);
        const indexSet = new IndexSet(newTreeIndices);

        return {
          groups: [
            ...prev.groups,
            {
              treeIndexSet: indexSet,
              style: {
                color: new Color().setFromVector3(
                  new Vector3(Math.random(), Math.random(), Math.random())
                ),
                prioritizedForLoadingHint: 5
              }
            }
          ],
          defaultStyle: prev.defaultStyle
        };
      });
    };

    viewer.on('click', callback);
    return () => {
      viewer.off('click', callback);
    };
  }, [viewer, platformStyling, setPlatformStyling]);

  useEffect(() => {
    if (treeIndices === undefined) return;

    const stylingGroupRed: TreeIndexStylingGroup = {
      treeIndexSet: new IndexSet(treeIndices),
      style: {
        color: new Color('red'),
        renderInFront: true
      }
    };

    setPlatformStyling({
      defaultStyle: DefaultNodeAppearance.Ghosted,
      groups: [stylingGroupRed]
    });
  }, [viewer, data]);

  const onModelLoaded = (model: CogniteCadModel): void => {
    viewer.fitCameraToModel(model);
  };

  return (
    <>
      <CadModelContainer
        addModelOptions={platformModelOptions}
        styling={platformStyling}
        onLoad={onModelLoaded}
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
