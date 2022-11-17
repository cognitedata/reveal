import { Meta, Story } from '@storybook/react';
import { CommonTable } from 'components/CommonTable/CommonTable';
import { ComponentProps } from 'react';

export default {
  component: CommonTable,
  title: 'Components/Reusable Table',
  argTypes: {},
} as Meta;

const Template: Story<ComponentProps<typeof CommonTable>> = (args) => (
  <CommonTable {...args} />
);

export const Default = Template.bind({});

Default.args = {
  data: [{ name: 'Test', value: '1' }],
  columns: [
    {
      accessor: 'name',
      Header: 'Name',
    },
    {
      accessor: 'value',
      Header: 'Value',
    },
  ],
};
