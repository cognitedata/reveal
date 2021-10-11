import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { DateTabType } from '../../types';
import {
  LAST_CREATED_DATE_TAB_KEY,
  LAST_MODIFIED_DATE_TAB_KEY,
  LAST_CREATED_DATE_TAB_TEXT,
  LAST_MODIFIED_DATE_TAB_TEXT,
} from '../constants';
import { DateRangeTabs } from '../DateRangeTabs';

describe('DateRangeTabs', () => {
  const page = (viewProps?: any) =>
    testRenderer(DateRangeTabs, undefined, viewProps);

  const setActiveKey = jest.fn((value: DateTabType) => value);

  const testInit = async (activeKey?: DateTabType) => {
    return {
      ...page({ activeKey, setActiveKey }),
    };
  };

  const getTabTextBySelected = (selected: boolean): string =>
    screen.getByRole('tab', { selected }).innerHTML;

  it('should render tabs correctly', async () => {
    await testInit();

    expect(screen.getByText(LAST_CREATED_DATE_TAB_TEXT)).toBeInTheDocument();
    expect(screen.getByText(LAST_MODIFIED_DATE_TAB_TEXT)).toBeInTheDocument();
  });

  it('should render according to `defaultActiveKey` when `activeKey` is not provided', async () => {
    await testInit();

    expect(getTabTextBySelected(true)).toEqual(LAST_CREATED_DATE_TAB_TEXT);
    expect(getTabTextBySelected(false)).toEqual(LAST_MODIFIED_DATE_TAB_TEXT);
  });

  it('should render the tab according to the passed `activeKey`', async () => {
    await testInit(LAST_MODIFIED_DATE_TAB_KEY);

    expect(getTabTextBySelected(false)).toEqual(LAST_CREATED_DATE_TAB_TEXT);
    expect(getTabTextBySelected(true)).toEqual(LAST_MODIFIED_DATE_TAB_TEXT);
  });

  it('should switch between tabs as expected', async () => {
    await testInit(LAST_CREATED_DATE_TAB_KEY);

    // Click on `Modified Date` tab.
    fireEvent.click(screen.getByText(LAST_MODIFIED_DATE_TAB_TEXT));
    expect(setActiveKey).toHaveBeenCalledWith(LAST_MODIFIED_DATE_TAB_KEY);

    // Click on `Created Date` tab.
    fireEvent.click(screen.getByText(LAST_MODIFIED_DATE_TAB_TEXT));
    expect(setActiveKey).toHaveBeenCalledWith(LAST_MODIFIED_DATE_TAB_KEY);
  });
});
