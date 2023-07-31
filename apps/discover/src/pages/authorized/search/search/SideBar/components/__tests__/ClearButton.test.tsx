import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { DocumentsFacets } from 'modules/documentSearch/types';

import { ClearButton } from '../ClearButton';

describe('ClearButton', () => {
  const page = (viewProps?: any) =>
    testRenderer(ClearButton, undefined, viewProps);

  const filtersMock = {
    fileCategory: [],
    labels: [],
    lastmodified: [],
    lastcreated: [],
    location: [],
    pageCount: [],
  };

  const handleClearDate = jest.fn();

  const testInit = async (activeKey: string, filters: DocumentsFacets) => {
    return {
      ...page({
        activeKey,
        filters,
        handleClearDate,
      }),
    };
  };

  it('should not render `Clear` button when there is no filters regardless `activeKey`', async () => {
    await testInit('lastcreated', filtersMock);
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();

    testInit('lastmodified', filtersMock);
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('should render `Clear` button when `activeKey` is `lastcreated` and `filters.lastcreated` is not empty', async () => {
    await testInit('lastcreated', {
      ...filtersMock,
      lastcreated: ['test-lastcreated'],
    });
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should render `Clear` button when `activeKey` is `lastmodified` and `filters.lastmodified` is not empty', async () => {
    await testInit('lastmodified', {
      ...filtersMock,
      lastmodified: ['test-lastmodified'],
    });
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should only render `Clear` button when `activeKey` is matched with `filters.lastcreated` or `filters.lastmodified`', async () => {
    // `activeKey` is `lastcreated` but only `filters.lastmodified` has elements.
    await testInit('lastcreated', {
      ...filtersMock,
      lastmodified: ['test-lastmodified'],
    });
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();

    // `activeKey` is `lastmodified` but only `filters.lastcreated` has elements.
    await testInit('lastmodified', {
      ...filtersMock,
      lastcreated: ['test-lastcreated'],
    });
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('should call `handleClearDate` once when `Clear` button is clicked once.', async () => {
    await testInit('lastmodified', {
      ...filtersMock,
      lastmodified: ['test-lastmodified'],
    });
    fireEvent.click(screen.getByText('Clear'));
    expect(handleClearDate.mock.calls.length).toBe(1);
  });
});
