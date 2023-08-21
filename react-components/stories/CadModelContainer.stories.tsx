/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer, CadModelStyling, CogniteCadModelProps, NodeStylingGroup, RevealContainer, useReveal } from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { CogniteCadModel, DefaultNodeAppearance, NumericRange } from '@cognite/reveal';
import { useSDK } from '../src/components/RevealContainer/SDKProvider';
import { useEffect, useMemo, useState } from 'react';
import { useMappedEquipmentByRevisionList } from '../src/hooks/useMappedEquipmentBy3DModelsList';

const meta = {
  title: 'Example/PrimitiveWrappers/CadModelContainer',
  component: CadModelContainer,
  argTypes: {
    styling: {
      description: 'Styling of the first model',
      options: ['FullRed', 'HalfGreen', 'SomeBlue', 'Colorful', 'None'],
      control: {
        type: 'radio'
      },
      label: 'Styling of the first model',
      mapping: {
        FullRed: {
          defaultStyle: { color: new Color('red') }
        },
        HalfGreen: {
          groups: [
            {
              treeIndices: new NumericRange(0, 40),
              style: { color: new Color('green') }
            }
          ]
        },
        SomeBlue: {
          groups: [
            {
              nodeIds: [
                8757509474262596, 2712303310330098, 1903632131225149, 8923105504012177,
                3709428615074138
              ],
              style: { color: new Color('blue') }
            }
          ]
        },
        Colorful: {
          groups: [
            {
              treeIndices: new NumericRange(0, 40),
              style: { color: new Color('red') }
            },
            {
              nodeIds: [1903632131225149, 8923105504012177],
              style: { color: new Color('green') }
            },
            {
              nodeIds: [8757509474262596, 2712303310330098, 3709428615074138],
              style: { color: new Color('blue') }
            }
          ]
        },
        None: {}
      }
    },
    addModelOptions: {
      description: 'Options for loading the model',
      options: ['Platform', 'primitives'],
      control: {
        type: 'radio'
      },
      label: 'Options for loading the model',
      mapping: {
        Platform: {
          modelId: 2231774635735416,
          revisionId: 912809199849811,
        },
        primitives: {
          modelId: 1791160622840317,
          revisionId: 498427137020189
        }
      }
    },
  },
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 1791160622840317,
      revisionId: 498427137020189
    },
    styling: {
      defaultStyle: { color: new Color('red') }
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({ addModelOptions, transform, styling }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <Models addModelOptions={addModelOptions} styling={styling} transform={transform} />
    </RevealContainer>
  )
};

const Models = ({ addModelOptions, styling, transform }: CogniteCadModelProps) => {
  const platformModelOptions = {
    modelId: 2231774635735416,
    revisionId: 912809199849811,
  };

  const viewer = useReveal();

  const [platformStyling, setPlatformStyling] = useState<CadModelStyling>();

  const { data } = useMappedEquipmentByRevisionList([platformModelOptions]);

  const nodeIds = useMemo(() => data?.get(`${platformModelOptions.modelId}-${platformModelOptions.revisionId}`)?.map(edge => edge.properties.revisionNodeId), [data]);

  useEffect(() => {
   const callback = () => {
      if (!platformStyling || !nodeIds) return;

      setPlatformStyling((prev) => {
        if (!prev?.groups) return prev;
        console.log('New group', prev.groups);

        const newNodeIds = getRandomSubset(nodeIds, nodeIds.length*0.8);

        return {
          groups: [...prev.groups,
            {
              nodeIds: newNodeIds.slice(0, newNodeIds.length / 2),
              style: {
                color: new Color().setFromVector3(new Vector3(Math.random(), Math.random(), Math.random())),
                prioritizedForLoadingHint: true
              }
            }
          ],
          defaultStyle: prev.defaultStyle
        }
      });
    };

    viewer.on('click', callback);
    return () => {
      viewer.off('click', callback);
    }
  }, [viewer, platformStyling, setPlatformStyling])

  useEffect(() => {
    
      if (!nodeIds) return;

      const stylingGroupRed: NodeStylingGroup = {
        nodeIds: nodeIds.slice(0, nodeIds.length / 2),
        style: {
          color: new Color('red'),
          renderInFront: true
        }
      };

      const stylingGroupGreen: NodeStylingGroup = {
        nodeIds: nodeIds.slice(nodeIds.length / 2),
        style: {
          color: new Color('green'),
          renderInFront: true
        }
      };
  
      setPlatformStyling({
        defaultStyle: DefaultNodeAppearance.Ghosted,
        groups: [
          stylingGroupRed, stylingGroupGreen
        ]
      });
    console.log('set')
  }, [viewer, data])

  const onModelLoaded = (model: CogniteCadModel) => {
    viewer.fitCameraToModel(model);

  };

  return (<>
    <CadModelContainer addModelOptions={addModelOptions} styling={styling} />
    <CadModelContainer addModelOptions={addModelOptions} transform={transform} />
    <CadModelContainer addModelOptions={platformModelOptions} styling={platformStyling} onLoad={onModelLoaded}/>
    </>
  )

}

function getRandomSubset<T>(array: Array<T>, size: number) {
  const subset: Array<T> = [];

  for (let i = 0; i < size; i++) {
    const index = Math.floor(Math.random() * array.length);
    
    subset.push(array[index]);
  }

  return subset;
}