import { ComponentPropsWithoutRef } from 'react';

import { Meta, StoryFn } from '@storybook/react';

import { Button, Icon } from '@cognite/cogs.js';

import { ErrorIcon } from '../../components/Icons/Error';
import { SuccessIcon } from '../../components/Icons/Success';

import { UnsubscribeCard } from './UnsubscribeCard';

export default {
  component: UnsubscribeCard,
  title: 'Components/Unsubscribe Card',
} as Meta;

const Template: StoryFn<ComponentPropsWithoutRef<typeof UnsubscribeCard>> = (
  args
) => <UnsubscribeCard {...args} />;

export const Default = Template.bind({});
export const SuccessCard = Template.bind({});
export const ErrorCard = Template.bind({});
export const LoadingCard = Template.bind({});

Default.args = {
  icon: <div>Icon</div>,
  title: 'Title',
};

SuccessCard.args = {
  icon: <SuccessIcon />,
  title: 'Unsubscribed successfully',
  subtitle:
    'You will no longer receive email notifications from this monitoring job',
  actions: (
    <Button
      type="primary"
      icon="ArrowRight"
      iconPlacement="right"
      onClick={() => {
        console.log('Go to my charts');
      }}
    >
      Go to my charts
    </Button>
  ),
};

ErrorCard.args = {
  icon: <ErrorIcon />,
  title: 'Unsubscribe failed',
  subtitle: 'Please retry, try again later or contact us',
  actions: (
    <>
      <Button
        type="primary"
        icon="Refresh"
        iconPlacement="right"
        onClick={() => console.log('Retry')}
      >
        Retry
      </Button>
      <Button
        icon="ArrowRight"
        iconPlacement="right"
        onClick={() => {
          console.log('Go to my charts');
        }}
      >
        Go to my charts
      </Button>
    </>
  ),
};

LoadingCard.args = {
  icon: <Icon type="Loader" size={80} />,
  title: 'Unsubscribing',
  subtitle: 'Please wait while we process your request',
};
