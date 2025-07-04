import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer, type CadModelStyling, useCameraNavigation } from '../src';
import { Color, Matrix4 } from 'three';
import { type AddModelOptions } from '@cognite/reveal';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { useRef, useState, type ReactElement } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';

const meta = {
  title: 'Example/PrimitiveWrappers/CadModelContainer',
  component: CadModelContainer,
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
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives'),
    styling: {
      defaultStyle: { color: new Color('red') }
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({
    addModelOptions,
    transform,
    styling
  }: {
    addModelOptions: AddModelOptions;
    transform?: Matrix4;
    styling?: CadModelStyling;
  }) => {
    const [enabled, setEnabled] = useState<boolean>(true);
    return (
      <>
        <button
          onClick={() => {
            setEnabled((prev) => !prev);
          }}>
          {enabled ? 'Disable Models' : 'Enable Models'}
        </button>
        <RevealStoryContainer color={new Color(0x4a4a4a)}>
          <CadModelContainerStoryContent
            addModelOptions={addModelOptions}
            styling={styling}
            transform={transform}
            enabled={enabled}
          />
        </RevealStoryContainer>
      </>
    );
  }
};

type CadModelContainerStoryContentProps = {
  addModelOptions: AddModelOptions;
  transform?: Matrix4;
  styling?: CadModelStyling;
  enabled: boolean;
};

const CadModelContainerStoryContent = ({
  addModelOptions,
  transform,
  styling,
  enabled
}: CadModelContainerStoryContentProps): ReactElement => {
  const modelsLoadedRef = useRef(0);
  const cameraNavigationActions = useCameraNavigation();
  const onLoad = (): void => {
    modelsLoadedRef.current++;
    if (modelsLoadedRef.current === 2) {
      cameraNavigationActions.fitCameraToAllModels(0);
      signalStoryReadyForScreenshot();
    }
  };
  return (
    <>
      {enabled ? (
        <div>
          <CadModelContainer addModelOptions={addModelOptions} styling={styling} onLoad={onLoad} />
          <CadModelContainer
            addModelOptions={addModelOptions}
            transform={transform}
            onLoad={onLoad}
          />
        </div>
      ) : null}
    </>
  );
};
