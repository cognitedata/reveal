/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'components/Card/.storybook/boilerplate';
import Card from './Card';

storiesOf('watchtower|Card', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => <Card />)
  .add('Stateful story', () => {
    class StatefulCard extends React.Component {
      state = {};

      render() {
        return (
          <div>
            <Card />
          </div>
        );
      }
    }
    return <StatefulCard />;
  });
