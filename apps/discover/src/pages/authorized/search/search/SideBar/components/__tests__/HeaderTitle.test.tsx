import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useFilterBarIsOpen } from 'modules/sidebar/selectors';

import { HeaderTitle } from '../HeaderTitle';

jest.mock('modules/sidebar/selectors', () => ({
  useFilterBarIsOpen: jest.fn(),
}));

const HeaderTitleComponentWithChildren: React.FC = () => (
  <HeaderTitle title="test-title">test-children</HeaderTitle>
);

describe('HeaderTitle', () => {
  const mockUseFilterBarIsOpen = async (isOpen: boolean) => {
    (useFilterBarIsOpen as jest.Mock).mockImplementation(() => isOpen);
  };

  const page = (viewStore: Store) =>
    testRenderer(HeaderTitleComponentWithChildren, viewStore);

  const defaultTestInit = async () => {
    const store = getMockedStore();

    return { ...page(store) };
  };

  it('should not render children when `isOpen` is `false`', async () => {
    await mockUseFilterBarIsOpen(false);
    await defaultTestInit();

    expect(screen.queryByText('test-children')).not.toBeInTheDocument();
  });

  it('should render children when `isOpen` is `true`', async () => {
    await mockUseFilterBarIsOpen(true);
    await defaultTestInit();

    expect(screen.getByText('test-children')).toBeInTheDocument();
  });
});
