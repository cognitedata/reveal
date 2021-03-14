import React from 'react';
import configureStory from 'storybook/configureStory';

import ChartView from './ChartView';

export default {
  title: 'ChartView',
};

export const Base = () => {
  return <ChartView chartId="1" />;
};

Base.story = configureStory({});
