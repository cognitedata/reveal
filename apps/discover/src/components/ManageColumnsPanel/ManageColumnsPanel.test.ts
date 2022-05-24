import { screen, fireEvent } from '@testing-library/react';
import noop from 'lodash/noop';
import { Store } from 'redux';
import { store } from 'utils/store';

import { testRenderer } from '__test-utils/renderer';

import ManageColumnsPanel, { Props } from './ManageColumnsPanel';

const defaultProps = {
  isOpen: true,
  columns: [
    { selected: true, name: 'Field1', field: 'field1' },
    { selected: false, name: 'Field2', field: 'field2' },
    { selected: true, disabled: true, name: 'Field3', field: 'field3' },
  ],
  handleDisplayToggle: noop,
  handleColumnSelection: noop,
};

describe('ManageColumnsPanel', () => {
  const Page = (viewStore: Store, props: Props) =>
    testRenderer(ManageColumnsPanel, viewStore, props);

  // All tests will go here
  it('should open the mange columns panel when the icon button is clicked', async () => {
    Page(store, {
      ...defaultProps,
    });

    const button = screen.getByTestId('organize-columns');
    await fireEvent.click(button);

    expect(screen.getByText('Field2')).toBeInTheDocument();
  });

  it('should trigger onVisibilityToggle', async () => {
    const onVisibilityToggle = jest.fn();
    Page(store, {
      ...defaultProps,
      ...{ onVisibilityToggle },
    });

    const button = screen.getByTestId('organize-columns');
    await fireEvent.click(button);

    expect(onVisibilityToggle).toBeCalled();
    expect(onVisibilityToggle).toBeCalledTimes(1);
  });
});
