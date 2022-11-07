import React from 'react';
import styled from 'styled-components';
import { ComponentStory } from '@storybook/react';
import { AssetSummary } from './AssetSummary';

export default {
  title: 'Assets/AssetSummary',
  component: AssetSummary,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof AssetSummary> = args => (
  <AssetSummary {...args} />
);

const Container = styled.div`
  height: 600px;
`;
