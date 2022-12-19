import React from 'react';
import { Button } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { PartialStoryFn } from '@storybook/addons';
import { ResourceSelectorPropsFunctions } from './stub';
import { Wrapper } from './utils';
import { useResourceSelector, OpenSelectorProps } from '../context';

export default {
  title: 'Resource Selector',
  component: ResourceSelectorPropsFunctions,
  parameters: { docs: { source: { type: 'code' } } },
};

export const SelectingResources = (args: OpenSelectorProps) => {
  const { openResourceSelector } = useResourceSelector();
  return (
    <div>
      <Button
        onClick={() =>
          openResourceSelector({
            ...args,
            onSelect: action('onSelect'),
            onClose: action('onClose'),
          })
        }
      >
        Open Selector
      </Button>
    </div>
  );
};

SelectingResources.decorators = [
  (Story: PartialStoryFn<JSX.Element>) => (
    <Wrapper style={{ height: 800 }}>
      <Story />
    </Wrapper>
  ),
];
