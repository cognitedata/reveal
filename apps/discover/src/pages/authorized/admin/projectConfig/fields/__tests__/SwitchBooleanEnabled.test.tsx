import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SwitchBooleanEnabled, Props } from '../SwitchBooleanEnabled';

const getDefaultProps = (extras: Partial<Props> = {}) => ({
  name: 'Test name',
  label: 'Disabled',
  value: false,
  handleChange: jest.fn(),
  ...extras,
});

describe('SwitchBooleanEnabled', () => {
  const defaultTestInit = (props = {}) =>
    testRenderer(SwitchBooleanEnabled, undefined, getDefaultProps(props));

  it('should check the custom enabled value', () => {
    defaultTestInit({ value: true });
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('should check the custom disabled value', () => {
    defaultTestInit({ value: false });
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });
});
