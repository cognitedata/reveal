/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, vi, type Mock, afterEach } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useTranslation } from '../../i18n/I18n';
import { ShowMore } from './OutputPanelShowMore';

vi.mock('../../i18n/I18n');

describe('ShowMore', () => {
  afterEach(() => {
    cleanup();
  });

  (useTranslation as Mock).mockReturnValue({
    t: ({ key }: { key: string }) => (key === 'SHOW_MORE' ? 'Show More' : 'Show Less')
  });

  it('should render the ShowMore component with "Show More" text', () => {
    const onShowMore = vi.fn();
    const { getByText, getByTestId } = render(
      <ShowMore onShowMore={onShowMore} isShowMore={false} />
    );

    const button = getByTestId('show-more-button');
    const buttonText = getByText('Show More');

    expect(button).toBeDefined();
    expect(buttonText).toBeDefined();
  });

  it('should render the ShowMore component with "Show Less" text', () => {
    const onShowMore = vi.fn();
    const { getByText, getByTestId } = render(
      <ShowMore onShowMore={onShowMore} isShowMore={true} />
    );

    const button = getByTestId('show-more-button');
    const buttonText = getByText('Show Less');

    expect(button).toBeDefined();
    expect(buttonText).toBeDefined();
  });

  it('should call onShowMore when the button is clicked', async () => {
    const onShowMore = vi.fn();
    const { getByTestId } = render(<ShowMore onShowMore={onShowMore} isShowMore={false} />);

    const button = getByTestId('show-more-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onShowMore).toHaveBeenCalled();
    });
  });

  it('should apply the correct styles when isShowMore is true', () => {
    const onShowMore = vi.fn();
    const { container } = render(<ShowMore onShowMore={onShowMore} isShowMore={true} />);
    const paddingBottom = window
      .getComputedStyle(container.firstChild as Element)
      .getPropertyValue('padding-bottom');

    expect(paddingBottom).toBe('10px');
  });

  it('should apply the correct styles when isShowMore is false', () => {
    const onShowMore = vi.fn();
    const { container } = render(<ShowMore onShowMore={onShowMore} isShowMore={false} />);
    const paddingBottom = window
      .getComputedStyle(container.firstChild as Element)
      .getPropertyValue('padding-bottom');

    expect(paddingBottom).toBe('inherit');
  });
});
