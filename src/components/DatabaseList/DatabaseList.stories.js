/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Provider from 'subApp/explore/components/DatabaseList/.storybook/boilerplate';
import DatabaseList from './DatabaseList';

storiesOf('subApp/explore|DatabaseList', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => {
    const [selectedTable, setSelectedTable] = useState('');

    return (
      <DatabaseList
        hasWriteAcess={false}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        isFetching={false}
        setIsFetching={action('set is fetching')}
        deleteDatabase={action('delete database')}
        setCreateModalVisible={action('show create modal')}
        openKeys={[]}
      />
    );
  });
