import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import {
  COMMON_FILTER_KEYS,
  renderComponent,
} from '@data-exploration-lib/core';

import { FilterChip, FilterChipProps } from '../FilterChip';

jest.mock('@cognite/unified-file-viewer', () => {
  return {
    isSupportedFileInfo: jest.fn(() => true),
  };
});

describe('FilterChip', () => {
  const defaultProps: FilterChipProps = {
    name: 'test-name',
    value: 'test-value',
  };

  const testInit = (extraProps: Partial<FilterChipProps> = {}) => {
    return renderComponent(FilterChip, { ...defaultProps, ...extraProps });
  };

  it('should show formatted name and value', () => {
    testInit({ formatName: true });
    expect(screen.getByText('Test Name: test-value')).toBeTruthy();
  });

  it('should show name and value without formatting', () => {
    testInit({ formatName: false });
    expect(screen.getByText('test-name: test-value')).toBeTruthy();
  });

  it('should show icon', () => {
    testInit({ icon: 'Boolean', name: 'uncommon-key-name' });
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('should not show icon', () => {
    testInit({ icon: 'Boolean', name: COMMON_FILTER_KEYS[0] });
    expect(screen.queryByRole('img')).toBeFalsy();
  });

  it('should show close button', () => {
    testInit({ onClick: jest.fn() });
    expect(screen.getByLabelText('Remove Test Name: test-value')).toBeTruthy();
  });

  it('should not show close button', () => {
    testInit({ onClick: undefined });
    expect(screen.queryByTestId('close-button')).toBeFalsy();
  });
});
