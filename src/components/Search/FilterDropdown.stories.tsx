import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import FilterDropdown from './FilterDropdown';

export default {
  component: FilterDropdown,
  title: 'Components/Filter Dropdown',
} as Meta;

const Template: Story<ComponentProps<typeof FilterDropdown>> = (args) => (
  <FilterDropdown {...args} />
);

export const DefaultFilterDropdown = Template.bind({});

DefaultFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: true,
    isStepChecked: false,
    isStringChecked: false,
    isShowEmptyChecked: false,
  },
  onFilterChange: () => {},
};

export const StepFilterDropdown = Template.bind({});

StepFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: true,
    isStepChecked: true,
    isStringChecked: false,
    isShowEmptyChecked: false,
  },
  onFilterChange: () => {},
};

export const StringFilterDropdown = Template.bind({});

StringFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: true,
    isStepChecked: false,
    isStringChecked: true,
    isShowEmptyChecked: false,
  },
  onFilterChange: () => {},
};

export const ShowEmptyFilterDropdown = Template.bind({});

ShowEmptyFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: true,
    isStepChecked: false,
    isStringChecked: false,
    isShowEmptyChecked: true,
  },
  onFilterChange: () => {},
};

export const NoResultFilterDropdown = Template.bind({});

NoResultFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: false,
    isStepChecked: false,
    isStringChecked: false,
    isShowEmptyChecked: false,
  },
  onFilterChange: () => {},
};
