import React from 'react';
import { Button } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { PartialStoryFn } from '@storybook/addons';
import { useResourcePreview, ResourcePreviewProps } from '../context';
import { ResourcePreviewPropsFunctions } from './stub';
import { Wrapper } from './utils';

export const PreviewingResources = (args: ResourcePreviewProps) => {
  const { openPreview, hidePreview } = useResourcePreview();
  return (
    <div>
      <Button
        onClick={() =>
          openPreview({
            ...args,
            onClose: action('onClose'),
          })
        }
      >
        Open Preview
      </Button>
      <Button onClick={() => hidePreview()}>Close Preview</Button>
    </div>
  );
};
const Args: ResourcePreviewProps = {
  item: { type: 'asset', id: 560489721305992 },
};
PreviewingResources.args = Args;
const ArgType: {
  [key in keyof ResourcePreviewProps]?: any;
} = {
  item: {
    control: {
      type: 'object',
    },
  },
  header: {
    control: {
      type: 'object',
    },
  },
  footer: {
    control: {
      type: 'object',
    },
  },
  content: {
    control: {
      type: 'object',
    },
  },
  placeholder: {
    control: {
      type: 'object',
    },
  },
};
PreviewingResources.argTypes = ArgType;
PreviewingResources.decorators = [
  (Story: PartialStoryFn<JSX.Element>) => (
    <Wrapper>
      <Story />
    </Wrapper>
  ),
];

export default {
  title: 'Resource Preview',
  component: ResourcePreviewPropsFunctions,
  parameters: { docs: { source: { type: 'code' } } },
};
