/**
 * Unit Dropdown StoryBook
 */

import { Meta, Story } from '@storybook/react';
import UnitDropdown from './UnitDropdown';

type Props = React.ComponentProps<typeof UnitDropdown>;

export default {
  component: UnitDropdown,
  title: 'Components/Unit Dropdown',
} as Meta;

const Template: Story<Props> = (args) => (
  <UnitDropdown style={{ whiteSpace: 'nowrap' }} {...args} />
);

export const Default = Template.bind({});
export const Disabled = Template.bind({});
export const CustomUnitLabel = Template.bind({});
export const InputOutputSelected = Template.bind({});

Default.args = {
  open: true,
  onOverrideUnitClick: () => {},
  onConversionUnitClick: () => {},
  onCustomUnitLabelClick: () => {},
  onResetUnitClick: () => {},
};

Disabled.args = {
  disabled: true,
  onOverrideUnitClick: () => {},
  onConversionUnitClick: () => {},
  onCustomUnitLabelClick: () => {},
  onResetUnitClick: () => {},
};

CustomUnitLabel.args = {
  open: true,
  unit: '',
  originalUnit: 'psi',
  preferredUnit: '',
  customUnitLabel: 'NmX',
  onOverrideUnitClick: () => {},
  onConversionUnitClick: () => {},
  onCustomUnitLabelClick: () => {},
  onResetUnitClick: () => {},
};

InputOutputSelected.args = {
  open: true,
  unit: 'bar',
  originalUnit: 'psi',
  preferredUnit: 'psi',
  onOverrideUnitClick: () => {},
  onConversionUnitClick: () => {},
  onCustomUnitLabelClick: () => {},
  onResetUnitClick: () => {},
};
