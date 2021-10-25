/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'subApp/../../.storybook/boilerplate';
import { mockDataSet } from 'utils/mock';
import Lineage from './Lineage';

storiesOf('subApp/vision|Lineage', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => <Lineage dataSet={mockDataSet} />);
