import React from 'react';

import { AssetTable, FileTable } from '@data-exploration/containers';
// @ts-ignore There is a bug in the package not exporting the type
import { PartialStoryFn } from '@storybook/addons';

import { Button } from '@cognite/cogs.js';

import { Splitter } from '..';
import { useResourcePreview, ResourcePreviewProvider } from '../context';
import { assets } from '../stubs/assets';
import { files } from '../stubs/files';

import { Wrapper } from './utils';

export const ResourcesLargeTables = () => (
  <Splitter percentage secondaryMinSize={50}>
    <AssetTable id="test" data={assets} />
    <FileTable data={files as any} id="test" />
  </Splitter>
);
ResourcesLargeTables.decorators = [
  (Story: PartialStoryFn<JSX.Element>) => (
    <Wrapper>
      <Story />
    </Wrapper>
  ),
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
  (Story: PartialStoryFn<JSX.Element>) => (
    <Wrapper>
      <Story />
    </Wrapper>
  ),
];
export default {
  title: 'Data Exploration Components',
  component: () => null,
  parameters: { docs: { source: { type: 'code' } } },
};
