import {
  COMMON_COLUMN_HEADER,
  getMockSearchConfig,
  searchConfigCommonColumns,
  SearchConfigDataType,
} from '@data-exploration-lib/core';
import { fireEvent, screen } from '@testing-library/react';
import { renderComponent } from '@data-exploration/components';
import { CommonColumn } from '../CommonColumn';

const mockData = getMockSearchConfig();
describe('CommonColumn', () => {
  const onChange = jest.fn();
  const onToggleFuzzySearch = jest.fn();

  const initTest = (searchConfigData: SearchConfigDataType = mockData) => {
    renderComponent(CommonColumn, {
      searchConfigData,
      onChange,
      onToggleFuzzySearch,
    });
  };

  it('should render checkboxes and texts', () => {
    initTest();

    for (let column of searchConfigCommonColumns) {
      expect(screen.getByText(column)).toBeInTheDocument();
    }
    expect(screen.getByText(COMMON_COLUMN_HEADER)).toBeVisible();
    expect(screen.getByTestId('common-column-checkbox-Name')).toBeVisible();
  });

  it('should all checkboxes have checked state', () => {
    initTest();
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(
      searchConfigCommonColumns.length
    );
  });

  it('should trigger checkbox events', () => {
    initTest();

    fireEvent.click(screen.getByText(searchConfigCommonColumns[0]));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false, 0);
  });
});
