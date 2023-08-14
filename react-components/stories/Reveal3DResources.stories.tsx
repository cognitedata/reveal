/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  type AddResourceOptions,
  Reveal3DResources,
  RevealContainer,
  useCameraNavigation
} from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { type ReactElement } from 'react';

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
        <AppContent resources={resources} />
      </RevealContainer>
    );
  }
};

function AppContent({ resources }: { resources: AddResourceOptions[] }): ReactElement {
  const cameraNavigation = useCameraNavigation();
  const onLoad = (): void => {
    cameraNavigation.fitCameraToAllModels();
  };

  return <Reveal3DResources resources={resources} onResourcesAdded={onLoad} />;
}
