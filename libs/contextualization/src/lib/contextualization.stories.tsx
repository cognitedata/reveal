import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Contextualization } from './contextualization';

const Story: ComponentMeta<typeof Contextualization> = {
  component: Contextualization,
  title: 'Contextualization',
};
export default Story;

const Template: ComponentStory<typeof Contextualization> = (args) => (
  <Contextualization {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
