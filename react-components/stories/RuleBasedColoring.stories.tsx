/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RevealContainer, Reveal3DResources, type AddResourceOptions, RevealTopbar } from '../src';
import { Color } from 'three';
import { type ReactElement, useState } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

import { RuleBasedOutputsContainer } from '../src/components/RevealToolbar/RuleBasedOutputsContainer';

const meta = {
  title: 'Example/RuleBasedColoring',
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
        modelId: 4319392643513894,
        revisionId: 91463736617758,
        styling: {
          default: {
            color: new Color('#efefef')
          }
        }
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <StoryContent resources={resources} />
        <ReactQueryDevtools />
      </RevealContainer>
    );
  }
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [resourceIsLoaded, setResourceIsLoaded] = useState<boolean>(false);

  const onLoaded = (): void => {
    setResourceIsLoaded(true);
  };

  return (
    <>
      <RevealResourcesFitCameraOnLoad onResourcesAdded={onLoaded} resources={resources} />
      {resourceIsLoaded && <RevealTopbar topbarContent={<RuleBasedOutputsContainer />} />}
    </>
  );
};
