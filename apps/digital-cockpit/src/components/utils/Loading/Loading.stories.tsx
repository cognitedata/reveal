import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';

import Loading from './Loading';

const meta: Meta = {
  title: 'Utils / Loading',
  component: Loading,
};

export default meta;

const Template: ExtendedStory<object> = (args) => <Loading {...args} />;

export const Standard = Template.bind({});
Standard.story = configureStory({});
