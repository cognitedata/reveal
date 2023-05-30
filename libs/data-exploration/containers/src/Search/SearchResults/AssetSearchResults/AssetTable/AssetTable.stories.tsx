import React from 'react';

import styled from 'styled-components';

import { ComponentStory } from '@storybook/react';

import { assetsFixture } from '@data-exploration-lib/core';

import { AssetTable } from './AssetTable';

export default {
  title: 'Assets/AssetTable',
  component: AssetTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: {
    query: {
      type: 'string',
      defaultValue: '',
    },
  },
};

export const Example: ComponentStory<typeof AssetTable> = (args) => (
  <AssetTable {...args} />
);
Example.args = {
  data: assetsFixture,
};

export const ExampleSingleSelect: ComponentStory<typeof AssetTable> = (
  args
) => <AssetTable {...args} />;
ExampleSingleSelect.args = {
  data: assetsFixture,
};

const Container = styled.div`
  height: 600px;
`;
