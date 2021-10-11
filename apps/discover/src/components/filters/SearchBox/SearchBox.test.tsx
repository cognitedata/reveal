import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SearchBox } from './SearchBox';
import { SearchBoxProps } from './types';

describe('SearchBox', () => {
  const searchPhrase = 'TEST_SEARCH';

  const onSearch = jest.fn();
  const defaultProps = { onSearch };

  const testInit = (props: SearchBoxProps = defaultProps) =>
    testRenderer(SearchBox, undefined, props);

  it('should display input value inside search box as expected', () => {
    testInit();
    const searchBox = screen.getByTestId('search-box-input');

    fireEvent.change(searchBox, {
      target: { value: searchPhrase },
    });
    expect(screen.getByDisplayValue(searchPhrase)).toBeInTheDocument();
  });

  it('should call `onSearch` only after the `Enter` key is pressed', () => {
    testInit();
    const searchBox = screen.getByTestId('search-box-input');

    fireEvent.change(searchBox, {
      target: { value: searchPhrase },
    });
    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.keyDown(searchBox, {
      key: 'Enter',
      code: 13,
    });
    expect(onSearch).toHaveBeenCalledWith(searchPhrase);
  });
});
