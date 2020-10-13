/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '@cognite/cogs.js';

import Provider from 'components/EmptyState/.storybook/boilerplate';
import EmptyState from './EmptyState';

storiesOf('watchtower|EmptyState', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Default', () => <EmptyState />)
  .add('3D Model', () => <EmptyState type="ThreeDModel" />)
  .add('Favorites', () => <EmptyState type="Favorites" />)
  .add('Custom text', () => <EmptyState text="Custom text" />)
  .add('Extra', () => (
    <EmptyState
      text="Custom text"
      extra={<Button type="primary">Click me</Button>}
    />
  ))
  .add('Stateful story', () => {
    class StatefulEmptyState extends React.Component {
      state = {};

      render() {
        return (
          <div>
            <EmptyState />
          </div>
        );
      }
    }
    return <StatefulEmptyState />;
  });
