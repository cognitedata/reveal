/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Provider from 'subApp/explore/components/CreateTable/.storybook/boilerplate';
import CreateTable from './CreateTable';

storiesOf('subApp/explore|CreateTable', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => {
    const [name, setName] = useState('');

    return (
      <CreateTable
        name={name}
        setName={setName}
        createTable={action('Create table')}
      />
    );
  });
