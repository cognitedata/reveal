/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'subApp/../../.storybook/boilerplate';
import { mockDataSet } from 'utils/mock';
import GetDataInPage from './GetDataInPage';

storiesOf('subApp/vision|GetDataInPage', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => <GetDataInPage dataSet={mockDataSet} visible />);
