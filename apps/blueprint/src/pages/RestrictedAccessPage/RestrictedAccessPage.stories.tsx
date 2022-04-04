/* eslint-disable no-promise-executor-return */
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';

import RestrictedAccessPage, {
  RestrictedAccessPageProps,
} from './RestrictedAccessPage';

const meta: Meta<RestrictedAccessPageProps> = {
  title: 'Utils / Restricted Access Page',
  component: RestrictedAccessPage,
  argTypes: {
    setup: {
      name: 'Message',
      defaultValue: 'Error message',
    },
  },
};

export default meta;

const Template: ExtendedStory<RestrictedAccessPageProps> = (args) => (
  <RestrictedAccessPage {...args} />
);

export const Standard = Template.bind({});
