import { fireEvent, screen, render } from '@testing-library/react';

import { rgb } from 'color';
import { ExplorerPropType } from '../ExplorerTypes';

import { PersistState } from '../PersistState';

const componentProps: ExplorerPropType = {
  data: [
    {
      uniqueId: '1',
      name: 'OPH120939X349',
      children: [],
      isLoading: false,
      label: {
        italic: true,
        bold: false,
        color: rgb(0, 0, 0),
      },
    },
  ],
  onToggleVisible: () => {},
  onNodeExpandToggle: () => {},
  onTabChange: () => {},
  onNodeSelect: () => {},
  tabs: [],
  selectedTabIndex: -1,
};

describe('PersistState Tests', () => {
  const onToggleVisible = jest.spyOn(componentProps, 'onToggleVisible');

  const testInit = async () =>
    render(
      <PersistState props={componentProps}>
        {(onToggleNode: any) => (
          <button
            type="button"
            data-testid="button"
            onClick={(_) => onToggleNode('1')}
          >
            Simulate Wellbore selection
          </button>
        )}
      </PersistState>
    );

  it('togglingNode should set/unset its name in the localStorage', async () => {
    await testInit();
    fireEvent(
      screen.getByTestId('button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
    expect(onToggleVisible).toBeCalled();
    // using key from localStorage (instead of a static key) because the key
    // contains a prefixed string like "__v3__storage" added by the localStorage package
    // (which may change with an update in the storage package)
    expect(localStorage.key(0)?.includes('3d-wellnames')).toBe(true);
    const key = localStorage.key(0) || '';
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      key,
      '["OPH120939X349"]'
    );

    // toggling the button again
    fireEvent(
      screen.getByTestId('button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );

    // this time the local storage should be empty
    expect(localStorage.__STORE__[key]).toBe('[]');
  });
});
