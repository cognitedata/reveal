import React from 'react';
import { Button } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { ResourcePreviewPropsFunctions } from './stub';
import { Wrapper } from './utils';
import { useResourcePreview, ResourcePreviewProps } from '../context';

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
  item: { type: 'asset', id: 1 },
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
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];

export default {
  title: 'Resource Preview',
  component: ResourcePreviewPropsFunctions,
  parameters: { docs: { source: { type: 'code' } } },
};
