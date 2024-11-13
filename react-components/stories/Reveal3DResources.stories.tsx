/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { type AddResourceOptions, Reveal3DResources, RevealCanvas, RevealContext } from '../src';
import { Color } from 'three';
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
        revisionExternalId: 'cog_3d_revision_1617304887543490',
        revisionSpace: 'core_dm_data_space',
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        }
      }
      // {
      //   modelId: 8849721283303651,
      //   revisionId: 8057110773821863,
      //   styling: {
      //     default: {
      //       color: new Color('#efefef')
      //     },
      //     mapped: {
      //       color: new Color('#c5cbff')
      //     }
      //   }
      // }
    ]
  },
  render: ({ resources }: { resources: AddResourceOptions[] }) => {
    return (
      <RevealContext
        sdk={sdk}
        color={new Color(0x4a4a4a)}
        viewerOptions={{
          loadingIndicatorStyle: {
            opacity: 1,
            placement: 'topRight'
          }
        }}
        useCoreDm>
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
