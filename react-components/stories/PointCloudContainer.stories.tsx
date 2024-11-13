/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  PointCloudContainer,
  type PointCloudModelStyling,
  RevealCanvas,
  RevealContext,
  useClickedNodeData
} from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { type DataSourceType, type AddModelOptions } from '@cognite/reveal';
import { type ReactElement, useEffect } from 'react';

const meta = {
  title: 'Example/PrimitiveWrappers/PointCloudContainer',
  component: PointCloudContainer,
  argTypes: {
    styling: {
      options: ['FullRed', 'FullGreen', 'None', 'BlueAnnotations'],
      label: 'Styling of the first model',
      mapping: {
        FullRed: {
          defaultStyle: { color: new Color('red') }
        },
        FullGreen: {
          defaultStyle: { color: new Color('green') }
        },
        BlueAnnotations: {
          groups: [
            {
              annotationIds: [7526447911236241, 4768908317649926, 560990282344486],
              style: { color: new Color('blue') }
            }
          ]
        },
        None: {}
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof PointCloudContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    addModelOptions: {
      revisionExternalId: 'cog_3d_revision_1617304887543490',
      revisionSpace: 'core_dm_data_space'
    },
    styling: {},
    transform: new Matrix4()
  },
  render: ({
    addModelOptions,
    transform,
    styling
  }: {
    addModelOptions: AddModelOptions<DataSourceType>;
    transform?: Matrix4;
    styling?: PointCloudModelStyling;
  }) => (
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)} useCoreDm>
      <RevealCanvas>
        <StoryContent addModelOptions={addModelOptions} transform={transform} styling={styling} />
      </RevealCanvas>
    </RevealContext>
  )
};

const StoryContent = ({
  addModelOptions,
  transform,
  styling
}: {
  addModelOptions: AddModelOptions<DataSourceType>;
  transform?: Matrix4;
  styling?: PointCloudModelStyling;
}): ReactElement => {
  const nodeData = useClickedNodeData();
  useEffect(() => {
    if (nodeData?.intersection !== undefined) {
      console.log('nodeData?.intersection', nodeData?.intersection);
    }
  }, [nodeData]);

  return (
    <PointCloudContainer
      addModelOptions={addModelOptions}
      transform={transform}
      styling={styling}
    />
  );
};
