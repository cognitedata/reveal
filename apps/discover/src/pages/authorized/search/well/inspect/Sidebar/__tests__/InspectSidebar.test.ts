import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { InspectSidebar, Props } from '../InspectSidebar';

const onToggle = jest.fn();
const onResize = jest.fn();

describe('Well Inspect Sidebar Hide Button', () => {
  const page = (viewStore: Store, props: Props) =>
    testRenderer(InspectSidebar, viewStore, props);

  const defaultTestInit = async (props: Props) => {
    const store = getMockedStore();

    return { ...page(store, props), store };
  };

  const defaultProps = {
    isOpen: false,
    width: 352,
    onToggle,
    onResize,
  };

  it(`should render block expander on sidebar collapsed`, async () => {
    await defaultTestInit({ ...defaultProps });
    const element = screen.getByTestId('block-expander');
    expect(element).toBeInTheDocument();
  });

  it(`should render hide button on sidebar expand`, async () => {
    await defaultTestInit({
      ...defaultProps,
      isOpen: true,
    });
    const element = screen.getByTestId('well-inspect-sidebar-hide-btn');
    expect(element).toBeInTheDocument();
  });
});
