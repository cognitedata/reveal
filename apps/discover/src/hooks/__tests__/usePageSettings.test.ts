import { useLocation } from 'react-router-dom';

import { renderHook } from '@testing-library/react-hooks';

import { usePageSettings } from 'hooks/usePageSettings';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('usePageSettings', () => {
  it('should return `collapseTopbar` is true and `scrollPage` is false', async () => {
    (useLocation as jest.Mock).mockImplementation(() => ({
      pathname: '/search-test-path',
    }));
    const { result } = renderHook(() => usePageSettings());

    expect(result.current.collapseTopbar).toEqual(true);
    expect(result.current.scrollPage).toEqual(false);
  });

  it('should return `collapseTopbar` and `scrollPage` are true', async () => {
    (useLocation as jest.Mock).mockImplementation(() => ({
      pathname: './search-test-path',
    }));
    const { result } = renderHook(() => usePageSettings());

    expect(result.current.collapseTopbar).toEqual(true);
    expect(result.current.scrollPage).toEqual(true);
  });
});
