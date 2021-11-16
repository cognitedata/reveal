/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'subApp/../../.storybook/boilerplate';
import { mockUserWithGroups } from 'utils/testResources/testUtils';
import TableContent from './TableContent';

storiesOf('subApp/explore|TableContent', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => {
    return (
      <TableContent
        table="Some table"
        database="some db"
        user={mockUserWithGroups}
      />
    );
  });
