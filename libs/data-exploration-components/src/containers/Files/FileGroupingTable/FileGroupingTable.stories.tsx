import { ComponentStory } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import FileGroupingTable from './FileGroupingTable';

export default {
  title: 'Files/FileGroupingTable',
  component: FileGroupingTable,
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof FileGroupingTable> = args => (
  <Container>
    <FileGroupingTable {...args} />
  </Container>
);

const Container = styled.div`
  height: 400px;
`;
