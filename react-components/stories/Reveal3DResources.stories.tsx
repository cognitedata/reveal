/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealContainer, RevealToolbar } from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { DefaultPointCloudAppearance } from '@cognite/reveal';
import styled from 'styled-components';

const meta = {
  title: 'Example/Reveal3DResources',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

const StyledRevealToolBar = styled(RevealToolbar)`
  position: absolute;
  left: 20px;
  top: 80px;
`;

export const defaultResourceStyling = {
  pointcloud: {
    default: DefaultPointCloudAppearance
  }
} as const;

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
        siteId: 'c_RC_2'
      },
      {
        modelId: 3865289545346058,
        revisionId: 4160448151596909
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <RevealContainer
        sdk={sdk}
        color={new Color(0x4a4a4a)}
        viewerOptions={{
          loadingIndicatorStyle: {
            opacity: 1,
            placement: 'topRight'
          }
        }}>
        <RevealResourcesFitCameraOnLoad
          resources={resources}
          defaultResourceStyling={defaultResourceStyling}
          onResourceLoadError={(resource, error) => {
            console.log(
              `Failed to load resource ${JSON.stringify(resource)}: ${JSON.stringify(error)}`
            );
          }}
        />
        <StyledRevealToolBar />
      </RevealContainer>
    );
  }
};
