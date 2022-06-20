import React from 'react';
import { storiesOf } from '@storybook/react';
import { MemoryRouter as Router } from 'react-router-dom';
import NewHeader from './NewHeader';

storiesOf('watchtower|NewHeader', module)
  .addDecorator((story) => <Router>{story()}</Router>)
  .add('With specific ornament color & all props', () => (
    <NewHeader title="Title" ornamentColor="yellow" />
  ));
