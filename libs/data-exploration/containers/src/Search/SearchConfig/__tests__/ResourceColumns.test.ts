import {
  getMockSearchConfig,
  getTitle,
  ResourceTypes,
  SearchConfigDataType,
} from '@data-exploration-lib/core';
import { ResourceColumns } from '../ResourceColumns';
import { fireEvent, screen } from '@testing-library/react';
import { renderComponent } from '@data-exploration/components';

const totalNumberOfCheckboxes = 32;

const mockData = getMockSearchConfig();

describe('ResourceColumns', () => {
  const onChange = jest.fn();
  const initTest = (searchConfigData: SearchConfigDataType = mockData) => {
    renderComponent(ResourceColumns, {
      searchConfigData,
      onChange,
    });
  };

  it('should render all resources', () => {
    initTest();

    expect(screen.getByText(getTitle(ResourceTypes.Asset, true))).toBeVisible();
    expect(screen.getByText(getTitle(ResourceTypes.Event, true))).toBeVisible();
    expect(screen.getByText(getTitle(ResourceTypes.File, true))).toBeVisible();
    expect(
      screen.getByText(getTitle(ResourceTypes.Sequence, true))
    ).toBeVisible();
    expect(
      screen.getByText(getTitle(ResourceTypes.TimeSeries, true))
    ).toBeVisible();
  });

  it('should render all dividers and checkboxes', () => {
    initTest();

    expect(screen.getByTestId('modal-checkbox-asset-name')).toBeVisible();
    expect(screen.getAllByTestId('search-config-divider')).toHaveLength(5);
  });

  it('should all the checkboxes have checked state', () => {
    initTest();

    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(
      totalNumberOfCheckboxes
    );
  });

  it('should trigger checkbox event', () => {
    initTest();

    fireEvent.click(screen.getAllByLabelText('Name')[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false, 'asset', 'name');
  });
});
