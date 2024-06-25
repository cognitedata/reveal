/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealCanvas, RevealContext } from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

const meta = {
  title: 'Example/Reveal3DResources',
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
        modelId: 1791160622840317,
        revisionId: 498427137020189,
        transform: new Matrix4().makeTranslation(40, 0, 0)
      },
      {
        modelId: 1791160622840317,
        revisionId: 498427137020189,
        transform: new Matrix4().makeTranslation(40, 10, 0)
      },
      {
        siteId: 'c_RC_2',
        transform: new Matrix4()
      },
      {
        modelId: 3865289545346058,
        revisionId: 4160448151596909
      }
    ]
  },
  render: ({ resources }) => {
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
            onResourceLoadError={(resource, error) => {
              console.error(
                `Failed to load resource ${JSON.stringify(resource)}: ${JSON.stringify(error)}`
              );
            }}
          />
        </RevealCanvas>
      </RevealContext>
    );
  }
};
