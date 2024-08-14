/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealCanvas, RevealContext, RevealToolbar } from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

const model = {
  modelId: 7646043527629245,
  revisionId: 6059566106376463,
  transform: new Matrix4().makeTranslation(-340, -480, 80)
};

const meta = {
  title: 'Example/ModelsStyling',
  component: Reveal3DResources,
  tags: ['autodocs'],
  argTypes: {
    resources: {
      description: 'Styling of all models',
      options: ['RedDefaultGreenMapped', 'GreenDefaultRedMapped', 'None'],
      control: {
        type: 'radio'
      },
      label: 'Styling of models',
      mapping: {
        RedDefaultGreenMapped: [
          {
            ...model,
            styling: { default: { color: new Color('red') }, mapped: { color: new Color('green') } }
          }
        ],
        GreenDefaultRedMapped: [
          {
            ...model,
            styling: {
              default: { color: new Color('green') },
              mapped: { color: new Color('red') }
            }
          }
        ],
        None: [
          {
            ...model
          }
        ]
      }
    }
  }
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        ...model
      }
    ],
    defaultResourceStyling: {
      cad: {
        default: { color: new Color('#efefef') },
        mapped: { color: new Color('#c5cbff') }
      }
    }
  },
  render: ({ resources, defaultResourceStyling }) => {
    return (
      <RevealContext
        sdk={sdk}
        color={new Color(0x4a4a4a)}
        viewerOptions={{
          loadingIndicatorStyle: {
            opacity: 1,
            placement: 'topRight'
          }
        }}>
        <RevealCanvas>
          <RevealResourcesFitCameraOnLoad
            resources={resources}
            defaultResourceStyling={defaultResourceStyling}
          />
          <RevealToolbar />
        </RevealCanvas>
      </RevealContext>
    );
  }
};
