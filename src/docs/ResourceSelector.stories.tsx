import React from 'react';
import { Button } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { ResourceType } from '../types';
import { asset, ResourceSelectorPropsFunctions } from './stub';
import { store, Wrapper } from './utils';
import {
  ResourceSelectionMode,
  useResourceSelector,
  OpenSelectorProps,
  ResourceSelectionProps,
} from '../context';

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
const Args: OpenSelectorProps = {
  allowEdit: false,
  mode: 'single',
  resourceTypes: ['asset', 'file', 'timeSeries', 'event', 'sequence'],
};
SelectingResources.args = Args;
const ArgType: {
  [key in keyof OpenSelectorProps & keyof ResourceSelectionProps]?: any;
} = {
  allowEdit: {
    control: {
      type: 'boolean',
    },
  },
  mode: {
    control: {
      type: 'select',
      options: ['single', 'multiple', 'none'] as ResourceSelectionMode[],
    },
  },
  resourceTypes: {
    control: {
      type: 'inline-check',
      options: [
        'asset',
        'file',
        'timeSeries',
        'event',
        'sequence',
      ] as ResourceType[],
    },
  },
  assetFilter: {
    control: {
      type: 'object',
    },
  },
  timeseriesFilter: {
    control: {
      type: 'object',
    },
  },
  eventFilter: {
    control: {
      type: 'object',
    },
  },
  sequenceFilter: {
    control: {
      type: 'object',
    },
  },
  fileFilter: {
    control: {
      type: 'object',
    },
  },
};
SelectingResources.argTypes = ArgType;
SelectingResources.decorators = [
  Story => {
    store.dispatch({
      type: 'assets/SEARCH',
      filter: { filter: {} },
    });
    store.dispatch({
      type: 'assets/COUNT',
      scope: { filter: {} },
    });
    store.dispatch({
      type: 'assets/UPDATE_ITEMS',
      result: [asset],
    });
    store.dispatch({
      type: 'assets/SEARCH_DONE',
      filter: { filter: {} },
      result: [asset],
    });
    store.dispatch({
      type: 'assets/COUNT_DONE',
      scope: { filter: {} },
      count: 1,
    });
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];
export default {
  title: 'Resource Selector',
  component: ResourceSelectorPropsFunctions,
  parameters: { docs: { source: { type: 'code' } } },
};
