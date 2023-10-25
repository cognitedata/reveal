/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer, RevealContainer } from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { NumericRange } from '@cognite/reveal';

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
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    addModelOptions: {
      localPath: '/primitives',
      modelId: -1,
      revisionId: -1
    },
    styling: {
      defaultStyle: { color: new Color('red') }
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({ addModelOptions, transform, styling }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <CadModelContainer addModelOptions={addModelOptions} styling={styling} />
      <CadModelContainer addModelOptions={addModelOptions} transform={transform} />
    </RevealContainer>
  )
};
