import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { HeadlessTable } from 'components/HeadlessTable/HeadlessTable';

export default {
  component: HeadlessTable,
  title: 'Components/Headless Table',
} as Meta;

const Template: Story<ComponentProps<typeof HeadlessTable>> = (args) => (
  <HeadlessTable {...args} />
);

export const Default = Template.bind({});

Default.args = {
  data: [{ id: 1, a: 1 }],
  columns: [
    {
      Header: 'Test',
      accessor: 'a',
    },
  ],
};
