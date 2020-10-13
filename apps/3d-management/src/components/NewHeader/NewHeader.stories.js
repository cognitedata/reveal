/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { MemoryRouter as Router } from 'react-router-dom';
import NewHeader from './NewHeader';

const leftItem = (
  <div style={{ background: 'blue', color: 'white', padding: 5 }}>
    Left item
  </div>
);

const rightItem = (
  <div style={{ background: 'green', color: 'white', padding: 5 }}>
    Right item
  </div>
);

const breadcrumbs = [{ title: 'Breadcrumb title', path: '/test' }];

storiesOf('watchtower|NewHeader', module)
  .addDecorator((story) => <Router>{story()}</Router>)
  .add('With title', () => <NewHeader title="Title" />)
  .add('With subtitle', () => (
    <NewHeader title="Title" subtitle="Subtitle text" />
  ))
  .add('With breadcrumbs', () => (
    <NewHeader title="Title" breadcrumbs={breadcrumbs} />
  ))
  .add('With left items', () => <NewHeader title="Title" leftItem={leftItem} />)
  .add('With right item', () => (
    <NewHeader title="Title" rightItem={rightItem} />
  ))
  .add('With right & left items', () => (
    <NewHeader title="Title" rightItem={rightItem} leftItem={leftItem} />
  ))
  .add('With specific ornament color', () => (
    <NewHeader title="Title" ornamentColor="yellow" />
  ))
  .add('With all props', () => (
    <NewHeader
      title="Title"
      subtitle="Subtitle text"
      ornamentColor="yellow"
      rightItem={rightItem}
      leftItem={leftItem}
      breadcrumbs={breadcrumbs}
    />
  ));
