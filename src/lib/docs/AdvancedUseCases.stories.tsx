import React from 'react';
import { Button } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { assets } from 'lib/stubs/assets';
import { files } from 'lib/stubs/files';
import { AssetTable, FileTable, Splitter } from '..';
import { useResourcePreview, ResourcePreviewProvider } from '../context';
import { Wrapper } from './utils';

export const ResourcesLargeTables = () => {
  return (
    <Splitter percentage secondaryMinSize={50}>
      <AssetTable items={assets} onItemClicked={action('onItemClicked')} />
      <FileTable items={files} onItemClicked={action('onItemClicked')} />
    </Splitter>
  );
};
ResourcesLargeTables.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];

const extraStyles: React.CSSProperties = {
  display: 'flex',
  height: '100%',
  width: '100%',
  flexDirection: 'column',
  background: 'grey',
};
export const NestingPreviews = () => {
  const Content = () => {
    const { openPreview } = useResourcePreview();
    return (
      <div>
        <Button
          onClick={() => {
            openPreview();
          }}
        >
          Open Preview
        </Button>
      </div>
    );
  };
  return (
    <div style={extraStyles}>
      <div style={{ height: '60px' }}>Header</div>
      <div style={{ flex: 1 }}>
        <ResourcePreviewProvider>
          <Content />
          <div
            style={{
              ...extraStyles,
              height: 300,
              background: 'lightgrey',
            }}
          >
            <div style={{ height: '60px' }}>Header 2</div>
            <div style={{ flex: 1 }}>
              <ResourcePreviewProvider>
                <Content />
              </ResourcePreviewProvider>
            </div>
          </div>
        </ResourcePreviewProvider>
      </div>
    </div>
  );
};
NestingPreviews.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];
export default {
  title: 'Data Exploration Components',
  component: () => null,
  parameters: { docs: { source: { type: 'code' } } },
};
