/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer } from '../src';
import { Color } from 'three';
import { type ReactElement } from 'react';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { DomainObjectPanel } from '../src/components/Architecture/DomainObjectPanel';
import { ActiveToolToolbar, MainToolbar, TopToolbar } from '../src/components/Architecture/Toolbar';
import { useRenderTarget } from '../src/components/RevealCanvas/ViewerContext';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';

const meta = {
  title: 'Example/Architecture',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: ({ addModelOptions }) => {
    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)} viewerOptions={{}}>
        <StoryContent addModelOptions={addModelOptions} />
        <MainToolbar />
        <TopToolbar />
        <ActiveToolToolbar />
        <DomainObjectPanel />
      </RevealStoryContainer>
    );
  }
};

function StoryContent({ addModelOptions }: { addModelOptions: AddModelOptions }): ReactElement {
  const renderTarget = useRenderTarget();
  return (
    <>
      <CadModelContainer
        addModelOptions={addModelOptions}
        onLoad={(_model: CogniteCadModel) => {
          renderTarget.onStartup();
        }}
      />
    </>
  );
}
