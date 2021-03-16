import React from 'react';
import configureStory from 'storybook/configureStory';

import ChartList from './ChartList';

export default {
  title: 'ChartList',
};

export const Base = () => {
  return <ChartList />;
};

Base.story = configureStory({});
