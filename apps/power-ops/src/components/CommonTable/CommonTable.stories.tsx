import { Meta, Story } from '@storybook/react';
import { CommonTable } from 'components/CommonTable/CommonTable';
import { ComponentProps } from 'react';

export default {
  component: CommonTable,
  title: 'Components/Common Table',
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

export const SelectedRow = Template.bind({});

SelectedRow.args = {
  data: [
    { name: 'Test', value: '1' },
    { name: 'Test 2', value: '2', isSelected: true },
  ],
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
