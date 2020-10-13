/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Provider from 'components/PageTitle/.storybook/boilerplate';
import PageTitle from './PageTitle';

storiesOf('watchtower|PageTitle', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => <PageTitle />)
  .add('Stateful story', () => {
    class StatefulPageTitle extends React.Component {
      state = {};

      render() {
        return (
          <div>
            <PageTitle />
          </div>
        );
      }
    }
    return <StatefulPageTitle />;
  });
