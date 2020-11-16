import React from 'react';
import configureStory from 'storybook/configureStory';
import { CHARTS_STATE } from 'mocks/charts';

import ChartView from './ChartView';

export default {
  title: 'ChartView',
};

export const Base = () => {
  return <ChartView chartId="1" />;
};

Base.story = configureStory({
  redux: {
    charts: CHARTS_STATE,
  },
});
