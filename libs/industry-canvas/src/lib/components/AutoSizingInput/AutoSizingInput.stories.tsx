import { useState } from 'react';

import { StoryFn } from '@storybook/react';

import AutoSizingInput from './AutoSizingInput';

export default {
  title: 'Components/AutoSizingInput Story',
  component: AutoSizingInput,
};

export const AutoSizingInputStory: StoryFn = () => {
  const [value, setValue] = useState('');
  return (
    <AutoSizingInput value={value} onChange={(e) => setValue(e.target.value)} />
  );
};

AutoSizingInputStory.args = {};
