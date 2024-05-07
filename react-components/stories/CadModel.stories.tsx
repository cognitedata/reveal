/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useCameraNavigation, Reveal3DResources, type AddResourceOptions, useReveal } from '../src';
import { Color, Matrix4 } from 'three';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { useEffect, type ReactElement } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';

const CadModelContainerStoryContent = ({
  transform,
  styling,
  ...restOptions
}: AddResourceOptions): ReactElement => {
  const cameraNavigationActions = useCameraNavigation();
  const onLoad = (): void => {
    console.log('AAAAAHHHH');
    cameraNavigationActions.fitCameraToAllModels(0);
    signalStoryReadyForScreenshot();
  };
  const viewer = useReveal();
  useEffect(() => {
    (window as any).viewer = viewer;
  }, []);
  return (
    <Reveal3DResources
      onResourcesAdded={onLoad}
      resources={[
        { transform, ...restOptions },
        { styling, ...restOptions }
      ]}
    />
  );
};

const meta = {
  title: 'Example/PrimitiveWrappers/CadModel',
  component: CadModelContainerStoryContent,
  argTypes: {
    styling: {
      description: 'Styling of the first model',
      options: ['FullRed', 'HalfGreen', 'None'],
      control: {
        type: 'radio'
      },
      label: 'Styling of the first model'
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainerStoryContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    ...getAddModelOptionsFromUrl('/primitives'),
    styling: {
      default: { color: new Color('red') }
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: (resource) => {
    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)}>
        <CadModelContainerStoryContent {...resource} />
      </RevealStoryContainer>
    );
  }
};
