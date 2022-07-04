import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  rootAssetsMissingExternalIdMock,
  rootAssetsMock,
} from 'models/charts/root-asset/mocks';
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
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMock,
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
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMock,
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
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMock,
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
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMock,
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
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMock,
};

export const SelectedFacilityFilterDropdown = Template.bind({});

SelectedFacilityFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: true,
    isStepChecked: false,
    isStringChecked: false,
    isShowEmptyChecked: false,
  },
  onFilterChange: () => {},
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMock,
  selectedFacility: 'b',
};

export const InvalidSelectedFacilityFilterDropdown = Template.bind({});

InvalidSelectedFacilityFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: true,
    isStepChecked: false,
    isStringChecked: false,
    isShowEmptyChecked: false,
  },
  onFilterChange: () => {},
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMock,
  selectedFacility: 'does-not-exist',
};

export const MissingExternalIdFacilityFilterDropdown = Template.bind({});

MissingExternalIdFacilityFilterDropdown.args = {
  settings: {
    isTimeseriesChecked: true,
    isStepChecked: false,
    isStringChecked: false,
    isShowEmptyChecked: false,
  },
  onFilterChange: () => {},
  onFacilityChange: () => {},
  availableFacilities: rootAssetsMissingExternalIdMock,
  selectedFacility: 'does-not-exist',
};
