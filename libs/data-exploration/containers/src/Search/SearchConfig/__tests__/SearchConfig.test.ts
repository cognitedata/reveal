import { renderComponent } from '@data-exploration/components';
import { fireEvent, screen } from '@testing-library/react';

import {
  SEARCH_CONFIG_SUBTITLE,
  SEARCH_CONFIG_TITLE,
} from '@data-exploration-lib/core';

import { SearchConfig } from '../SearchConfig';

describe('SearchConfig', () => {
  const onCancel = jest.fn();
  const onSave = jest.fn();

  const initTest = (visible: boolean) => {
    renderComponent(SearchConfig, { visible, onCancel, onSave });
  };

  it('should not render when visible is false', () => {
    initTest(false);

    expect(screen.queryByText(SEARCH_CONFIG_TITLE)).not.toBeInTheDocument();
  });

  it('should render modal when visible is true', () => {
    initTest(true);

    expect(screen.getByText(SEARCH_CONFIG_TITLE)).toBeVisible();
    expect(screen.getByText(SEARCH_CONFIG_SUBTITLE)).toBeVisible();
  });

  it('should trigger button actions', () => {
    initTest(true);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });

  it('should uncheck Name row when Name is unchecked from common column', () => {
    initTest(true);

    fireEvent.click(screen.getAllByLabelText('Name')[0]);

    screen.getAllByLabelText('Name').forEach((element) => {
      expect(element).not.toBeChecked();
    });

    expect(screen.getByLabelText('Type')).not.toBeChecked();
  });
});
