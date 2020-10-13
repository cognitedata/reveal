/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { MemoryRouter as Router } from 'react-router-dom';
import Provider from 'subApp/../../.storybook/boilerplate';
import Breadcrumbs from './Breadcrumbs';

storiesOf('watchtower|Breadcrumbs', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => (
    <Router>
      <Breadcrumbs
        breadcrumbs={[
          { title: 'I AM A CRUMB', path: '/no-where' },
          { title: 'I AM ANOTHER', path: '/some-where' },
          { title: 'I HAVE NO PATH' },
        ]}
      />
    </Router>
  ));
