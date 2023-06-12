import { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import { IndustryCanvasToolType } from '../../types';

import ToolbarComponent from './ToolbarComponent';

export default {
  title: 'Components/Toolbar Component Story',
  component: ToolbarComponent,
};

export const ToolbarComponentStory: ComponentStory<
  typeof ToolbarComponent
> = () => {
  const [activeTool, setActiveTool] = useState<IndustryCanvasToolType>(
    IndustryCanvasToolType.PAN
  );
  return (
    <ToolbarComponent activeTool={activeTool} onToolChange={setActiveTool} />
  );
};
