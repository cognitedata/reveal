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

const Template: Story<Props> = (args) => <UnitDropdown {...args} />;

export const UnitDropdowns = Template.bind({});

UnitDropdowns.args = {
  onOverrideUnitClick: () => {},
  onConversionUnitClick: () => {},
  onResetUnitClick: () => {},
};
