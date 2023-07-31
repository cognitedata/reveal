import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SwitchBoolean, Props } from '../SwitchBoolean';

const getDefaultProps = (extras: Partial<Props> = {}) => ({
  name: 'Test name',
  label: 'test-label',
  value: false,
  handleChange: jest.fn(),
  ...extras,
});

describe('SwitchBoolean', () => {
  const defaultTestInit = (props = {}) =>
    testRenderer(SwitchBoolean, undefined, getDefaultProps(props));

  it('should check the enabled value', () => {
    defaultTestInit({ value: true });
    expect(screen.getByText('test-label')).toBeInTheDocument();
  });

  it('should check the disabled value', () => {
    defaultTestInit({ value: false });
    expect(screen.getByText('test-label')).toBeInTheDocument();
  });

  it('should not show when value is loading', () => {
    testRenderer(SwitchBoolean, undefined, {
      name: 'Test name',
      label: 'test-label',
      handleChange: jest.fn(),
    });
    expect(screen.queryByText('test-label')).not.toBeInTheDocument();
  });
});
