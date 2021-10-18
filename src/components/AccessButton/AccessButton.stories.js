/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';
import Provider from 'subApp/../../.storybook/boilerplate';
import AccessButton from './AccessButton';

const mockGoodPermissions = [{ acl: 'analyticsAcl', actions: ['READ'] }];

const mockBadPermissions = [{ acl: 'analyticsAcl', actions: ['read'] }];

const mockUser = {
  user: 'mockUser',
  groups: [
    {
      name: 'mockGroup',
      capabilities: [
        {
          analyticsAcl: {
            version: 1,
            actions: ['READ', 'EXECUTE', 'LIST'],
            scope: { all: {} },
          },
        },
      ],
    },
  ],
};

storiesOf('Watchtower|AccessButton', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Base', () => (
    <div>
      This is a button that needs <strong>analyticsAcl:WRITE</strong>
      <br />
      <AccessButton
        permissions={mockGoodPermissions}
        user={mockUser}
        type="primary"
      >
        I AM ENABLED
      </AccessButton>
    </div>
  ))
  .add('Bad permissions', () => (
    <div>
      This is a button that needs <strong>analyticsAcl:WRITE </strong>
      but is given <strong>analyticsAcl:write </strong> so access will be denied
      <br />
      <AccessButton
        permissions={mockBadPermissions}
        user={mockUser}
        type="primary"
      >
        I AM DISABLED
      </AccessButton>
    </div>
  ))
  .add('Custom disabled', () => (
    <div>
      This is a button that is disabled for some other reason than permission
      <br />
      <AccessButton
        permissions={mockGoodPermissions}
        user={mockUser}
        type="primary"
        disabledMessage="This feature is not enabled for your project"
      >
        FANCY FEATURE
      </AccessButton>
    </div>
  ))
  .add('With confirmation', () => (
    <div>
      This is a button that will ask the user to confirm their action
      <br />
      <AccessButton
        permissions={mockGoodPermissions}
        user={mockUser}
        type="primary"
        confirmationMessage="Are you sure you want to click this?"
        onClick={() => {}}
      >
        I NEED CONFIRMATION
      </AccessButton>
    </div>
  ))
  .add('Antd button props', () => (
    <div>
      You can pass any other antd button props to this button
      <br />
      <AccessButton
        permissions={mockGoodPermissions}
        user={mockUser}
        icon="Feedback"
      >
        I HAVE PROPS
      </AccessButton>
    </div>
  ));
