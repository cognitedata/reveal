/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { type AddResourceOptions, Reveal3DResources, RevealCanvas, RevealContext } from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { IndexSet } from '@cognite/reveal';

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
        modelId: 3544114490298106,
        revisionId: 6405404576933316,
        transform: new Matrix4().makeTranslation(40, 0, 0),
        styling: {
          nodeGroups: [
            { treeIndexSet: new IndexSet([2, 4, 6, 8]), style: { color: new Color('blue') } }
          ]
        }
      },
      {
        modelId: 3544114490298106,
        revisionId: 6405404576933316,
        styling: { default: { color: new Color('red') } },
        transform: new Matrix4().makeTranslation(40, 10, 0)
      },
      {
        source: 'events',
        siteId: 'c_RC_2',
        transform: new Matrix4()
      },
      {
        modelId: 3865289545346058,
        revisionId: 4160448151596909
      }
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
