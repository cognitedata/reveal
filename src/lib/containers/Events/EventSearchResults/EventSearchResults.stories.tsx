import React from 'react';
import styled from 'styled-components';
import { text } from '@storybook/addon-knobs';
import { EventSearchResults } from './EventSearchResults';

export default {
  title: 'Search Results/EventSearchResults',
  component: EventSearchResults,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => <EventSearchResults query={text('query', '')} />;

const Container = styled.div`
  height: 400px;
`;
