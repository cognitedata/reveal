import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import ValueList from './ValueList';

export default {
  component: ValueList,
  title: 'Components/Details Sidebar/ValueList',
} as Meta;

const Template: Story<ComponentProps<typeof ValueList>> = (args) => (
  <div style={{ maxWidth: '25rem' }}>
    <ValueList {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  loading: false,
  list: [
    { label: 'String Label with number value', value: 1 },
    { label: 'String with copy btn', value: '2jks02e', copyable: true },
    { label: 'String Label', value: 1 },
    { label: 'Mean', value: '103°F' },
    { label: 'Median', value: '101°F' },
    {
      label: 'Standard Deviation',
      value: '38.1 °F ',
    },
    { label: 'Max', value: '114 °F' },
    { label: 'Min', value: '92.7 °F' },
  ],
};

export const Loading = Template.bind({});

Loading.args = {
  loading: true,
  list: [
    {
      label: 'Key name',
      value: '',
    },
    {
      label: 'Key name 1',
      value: '',
    },
    {
      label: 'Key name 2',
      value: '',
    },
    {
      label: 'Key name 3',
      value: '',
    },
  ],
};

export const NoData = Template.bind({});

NoData.args = {
  list: [],
  loading: false,
};
