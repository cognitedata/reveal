/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'subApp/explore/components/UploadCSV/.storybook/boilerplate';
import UploadCSV from './UploadCSV';

storiesOf('subApp/explore|UploadCSV', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => {
    return <UploadCSV table="some table" database="some db" csvModalVisible />;
  });
