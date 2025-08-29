/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { RuleBasedSelectionItem } from './RuleBasedSelectionItem';

describe('RuleBasedSelectionItem', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    onChange: vi.fn(),
    label: 'Test Label',
    id: 'test-id',
    checked: false,
    key: 'test-key',
    isLoading: false,
    isEmptyRuleItem: false
  };

  it('should render the RuleBasedSelectionItem component', () => {
    const { getByTestId } = render(<RuleBasedSelectionItem {...defaultProps} />);

    const ruleBasedSelectionItem = getByTestId('rule-based-selection-item');

    expect(ruleBasedSelectionItem).toBeDefined();
  });

  it('should call onChange when the item is clicked', () => {
    const { getByTestId } = render(<RuleBasedSelectionItem {...defaultProps} />);

    const ruleBasedSelectionItem = getByTestId('rule-based-selection-item');
    fireEvent.click(ruleBasedSelectionItem);

    expect(defaultProps.onChange).toHaveBeenCalledWith('test-id');
  });

  it('should render the LoaderIcon when isLoading is true and checked is true', () => {
    const props = { ...defaultProps, isLoading: true, checked: true };
    const { queryByTestId } = render(<RuleBasedSelectionItem {...props} />);

    const loaderIcon = queryByTestId('rule-based-loader-icon');
    expect(loaderIcon).toBeDefined();
  });

  it('should not render the LoaderIcon when isLoading is false', () => {
    const { queryByTestId } = render(<RuleBasedSelectionItem {...defaultProps} />);

    const loaderIcon = queryByTestId('rule-based-loader-icon');
    expect(loaderIcon).toBeNull();
  });

  it('should not render the LoaderIcon when checked is false', () => {
    const props = { ...defaultProps, isLoading: true, checked: false };
    const { queryByTestId } = render(<RuleBasedSelectionItem {...props} />);

    const loaderIcon = queryByTestId('rule-based-loader-icon');
    expect(loaderIcon).toBeNull();
  });

  it('should render the ColorPaletteIcon', () => {
    const { queryByTestId } = render(<RuleBasedSelectionItem {...defaultProps} />);
    const loaderIcon = queryByTestId('rule-based-color-pallete-icon');
    expect(loaderIcon).toBeDefined();
  });

  it('should not render the LoaderIcon when isEmptyRuleItem is true', () => {
    const props = { ...defaultProps, isLoading: true, checked: true, isEmptyRuleItem: true };
    const { queryByTestId } = render(<RuleBasedSelectionItem {...props} />);

    const loaderIcon = queryByTestId('rule-based-loader-icon');
    expect(loaderIcon).toBeNull();
  });
});
