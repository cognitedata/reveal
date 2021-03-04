import React from 'react';
import configureStory from 'storybook/configureStory';
import { CHARTS_STATE } from 'mocks/charts';
import { MOCK_ENVIRONMENT } from 'mocks/environment';

import ChartList from './ChartList';

export default {
  title: 'ChartList',
};

export const Base = () => {
  return <ChartList />;
};

Base.story = configureStory({
  redux: {
    charts: CHARTS_STATE,
    environment: MOCK_ENVIRONMENT,
  },
});
