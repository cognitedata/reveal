import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SwitchBoolean, Props } from '../SwitchBoolean';

const getDefaultProps = (extras: Partial<Props> = {}) => ({
  name: 'Test name',
  label: 'Disabled',
  value: false,
  handleChange: jest.fn(),
  ...extras,
});

describe('SwitchBoolean', () => {
  const defaultTestInit = (props = {}) =>
    testRenderer(SwitchBoolean, undefined, getDefaultProps(props));

  it('should check the custom enabled value', () => {
    defaultTestInit({ value: true });
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('should check the custom disabled value', () => {
    defaultTestInit({ value: false });
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('should check the disabled value - when not using the special inverse type', () => {
    defaultTestInit({ label: 'Normal mode' });
    expect(screen.getByText('Normal mode')).toBeInTheDocument();
  });

  it('should check the enabled value - when not using the special inverse type', () => {
    defaultTestInit({ label: 'Normal mode', value: true });
    expect(screen.getByText('Normal mode')).toBeInTheDocument();
  });
});
