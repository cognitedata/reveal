import { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import { ToolType } from '@cognite/unified-file-viewer';

import ToolbarComponent from './ToolbarComponent';

export default {
  title: 'Components/Toolbar Component Story',
  component: ToolbarComponent,
};

export const ToolbarComponentStory: ComponentStory<
  typeof ToolbarComponent
> = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.PAN);
  return (
    <ToolbarComponent activeTool={activeTool} onToolChange={setActiveTool} />
  );
};
